import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Gamepad2, Users, Factory, DollarSign, Building2, Scale, Laptop, TrendingUp, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Footer } from '@/app/components/Footer';
import cokeLogoImage from 'figma:asset/b7c663aaaffd2123e1f119dd74e53b5eadefff3c.png';
import heroImage from 'figma:asset/50df961786c08f3ce7403ef57839bc891028f51a.png';
import contentImage from 'figma:asset/0b77b80337e00e3daf4cb457032e58b6d56f04a0.png';
import deskImage from 'figma:asset/ff9936f7e451a179b1ac9cb210a5bceda3311140.png';
import timerImage from 'figma:asset/1d8eef4f0b971ebad3c5ec87490f803b5217cbb0.png';
import stackImage from 'figma:asset/dcb115b258b620033204da77a8a40088d031186f.png';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-8 overflow-y-auto">
        <div className="max-w-6xl w-full">
          {/* Hero Image */}
          <div className="mb-6">
            <img src={heroImage} alt="AI Adventure" className="w-full max-w-3xl mx-auto" />
          </div>

          {/* Hero Section - AI Adventure */}
          <div className="text-center mb-6">
            <h1 className="text-4xl text-gray-900 mb-3">
              <span className="text-[#F40009]">AI Adventure:</span> Master Work Through Play
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Real-world scenarios. Bite-sized games. 15 minutes to level up.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center mb-8">
            <Button
              onClick={onContinue}
              size="lg"
              className="bg-gradient-to-r from-[#F40009] to-[#DC0008] hover:from-[#DC0008] hover:to-[#C00007] text-white px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Gamepad2 className="h-6 w-6 mr-2" />
              Start Playing Now
              <ArrowRight className="h-6 w-6 ml-2" />
            </Button>
            
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="h-20 w-20 mx-auto mb-4">
                  <img src={deskImage} alt="Desk" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-base mb-2 text-gray-900 font-bold">Real Work, Simulated</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Play through actual business challenges in a risk-free sim</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="h-20 w-20 mx-auto mb-4">
                  <img src={timerImage} alt="Timer" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-base mb-2 text-gray-900 font-bold">15-Minute Power-Up.</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Complete 3 mini-games for a quick skills boost.</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="h-20 w-20 mx-auto mb-4">
                  <img src={stackImage} alt="Stack" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-base mb-2 text-gray-900 font-bold">Growing Universe</h3>
                <p className="text-gray-600 text-sm leading-relaxed">10+ missions live, new scenarios added monthly</p>
              </CardContent>
            </Card>
          </div>

          {/* What You'll Experience */}
          

          {/* Business Functions Preview */}
          
        </div>
      </div>
      <Footer />
    </div>
  );
}