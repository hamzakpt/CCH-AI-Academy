import os
from databricks import sql
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DATABRICKS_SERVER_HOSTNAME = os.getenv("DATABRICKS_SERVER_HOSTNAME")
DATABRICKS_HTTP_PATH = os.getenv("DATABRICKS_HTTP_PATH")
DATABRICKS_ACCESS_TOKEN = os.getenv("DATABRICKS_ACCESS_TOKEN")
DATABRICKS_CATALOG = os.getenv("DATABRICKS_CATALOG")
DATABRICKS_SCHEMA = os.getenv("DATABRICKS_SCHEMA")

def _quote_ident(name: str) -> str:
    """
    Quote a SQL identifier for Databricks/Spark SQL.
    Uses backticks and escapes internal backticks by doubling them.
    Example: a`b -> `a``b`
    """
    if name is None:
        return None
    return f"`{name.replace('`', '``')}`"

def execute_databricks_query(
    sql_query: str,
    *,
    server_hostname: str,
    http_path: str,
    access_token: str,
    catalog: str | None = None,
    schema: str | None = None,
    return_as: str = "dataframe",   # "dataframe" | "records"
):
    """
    Execute a SQL query on Databricks and return the results.

    Parameters:
    - sql_query (str): SQL to execute (single statement).
    - server_hostname (str): e.g. 'adb-12345.67.azuredatabricks.net'
    - http_path (str): e.g. '/sql/1.0/warehouses/abcd1234'
    - access_token (str): PAT token
    - catalog (str, optional): Catalog to USE (will be safely quoted)
    - schema (str, optional): Schema to USE (will be safely quoted)
    - return_as (str): 'dataframe' to return pandas.DataFrame,
                       'records' to return list[dict]

    Returns:
    - pandas.DataFrame or list[dict]
    """
    # Build optional preamble for catalog/schema selection
    preamble_statements = []
    if catalog:
        preamble_statements.append(f"USE CATALOG {_quote_ident(catalog)};")
    if schema:
        preamble_statements.append(f"USE SCHEMA {_quote_ident(schema)};")

    # Ensure the main query ends with a semicolon (good hygiene when batching)
    main_sql = sql_query.strip()
    if not main_sql.endswith(";"):
        main_sql += ";"

    try:
        with sql.connect(
            server_hostname=server_hostname,
            http_path=http_path,
            access_token=access_token,
        ) as connection:
            with connection.cursor() as cursor:
                # Run preamble statements (if any)
                for stmt in preamble_statements:
                    cursor.execute(stmt)

                # Execute the main query
                cursor.execute(main_sql)

                # Fetch results if the statement is a SELECT-like query
                # Some commands (e.g., CREATE/USE) return no rows, so handle gracefully
                if cursor.description is None:
                    # No tabular result; return empty DataFrame or empty list
                    return pd.DataFrame() if return_as == "dataframe" else []

                rows = cursor.fetchall()
                columns = [col[0] for col in cursor.description]
                df = pd.DataFrame(rows, columns=columns)

                if return_as == "records":
                    return df.to_dict(orient="records")
                return df

    except Exception as e:
        # Add context to the error while preserving the original message
        raise RuntimeError(
            f"Databricks query failed. "
            f"Catalog={catalog!r}, Schema={schema!r}, SQL={sql_query!r}\n"
            f"Original error: {e}"
        ) from e

def execute_schema_file(
    file_path: str,
    *,
    server_hostname: str,
    http_path: str,
    access_token: str,
    catalog: str | None = None,
    schema: str | None = None,
):
    """
    Read and execute SQL statements from a schema file.
    Parses CREATE TABLE statements and executes them one by one.
    """
    import re
    from pathlib import Path

    sql_content = Path(file_path).read_text()

    # Remove SQL comments (lines starting with --)
    lines = [line for line in sql_content.split('\n') if not line.strip().startswith('--')]
    sql_content = '\n'.join(lines)

    # Split by semicolons to get individual statements
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

    print(f"Found {len(statements)} SQL statements to execute")

    for i, stmt in enumerate(statements, 1):
        # Extract table name for logging
        table_match = re.search(r'CREATE TABLE.*?(\w+)\s*\(', stmt, re.IGNORECASE | re.DOTALL)
        table_name = table_match.group(1) if table_match else f"statement_{i}"

        print(f"[{i}/{len(statements)}] Creating table: {table_name}...", end=" ")

        try:
            execute_databricks_query(
                stmt,
                server_hostname=server_hostname,
                http_path=http_path,
                access_token=access_token,
                catalog=catalog,
                schema=schema,
            )
            print("OK")
        except Exception as e:
            print(f"FAILED: {e}")
            raise


def drop_all_tables(
    *,
    server_hostname: str,
    http_path: str,
    access_token: str,
    catalog: str | None = None,
    schema: str | None = None,
):
    """Drop all tables in the schema (use with caution!)."""
    tables = [
        "screen_activity",
        "scenario_ratings",
        "scenario_suggestions",
        "user_ratings",
        "learning_progress",
        "responses",
        "user_sessions",
        "learning_paths",
        "scenarios",
        "users",
    ]

    print(f"Dropping {len(tables)} tables...")
    for table in tables:
        print(f"  Dropping {table}...", end=" ")
        try:
            execute_databricks_query(
                f"DROP TABLE IF EXISTS {table}",
                server_hostname=server_hostname,
                http_path=http_path,
                access_token=access_token,
                catalog=catalog,
                schema=schema,
            )
            print("OK")
        except Exception as e:
            print(f"FAILED: {e}")


if __name__ == "__main__":
    hostname = DATABRICKS_SERVER_HOSTNAME
    path = DATABRICKS_HTTP_PATH
    token = DATABRICKS_ACCESS_TOKEN
    catalog = DATABRICKS_CATALOG
    schema = DATABRICKS_SCHEMA

    # Drop existing tables first (schema changed from INT to STRING IDs)
    print("=== Dropping existing tables ===")
    drop_all_tables(
        server_hostname=hostname,
        http_path=path,
        access_token=token,
        catalog=catalog,
        schema=schema,
    )

    # Execute the schema file to create all tables
    print("\n=== Creating Databricks tables from schema file ===")
    execute_schema_file(
        "databricks_schema.sql",
        server_hostname=hostname,
        http_path=path,
        access_token=token,
        catalog=catalog,
        schema=schema,
    )

    # Verify tables were created
    print("\n=== Verifying created tables ===")
    df = execute_databricks_query(
        "SHOW TABLES;",
        server_hostname=hostname,
        http_path=path,
        access_token=token,
        catalog=catalog,
        schema=schema,
    )
    print(df)