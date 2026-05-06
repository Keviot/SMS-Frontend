import type { ReactNode } from "react";
import pattern from "../assets/pattern.png";
import sms from "../assets/sms.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  illustration?: string;
  tagline?: ReactNode;
  step?: 1 | 2;
}

export default function AuthLayout({ children, title, illustration = sms, tagline, step = 1 }: AuthLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans selection:bg-orange-100">
      {/* Left Side - Branding & Illustration */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 items-center justify-center border-r border-gray-100">
        <div className="max-w-2xl w-full flex flex-col items-center">
          {/* Logo */}
          <div className="self-start mb-22 pl-4 mt-15 ml-15">
            <h1 className="text-4xl font-extrabold tracking-tighter">
              <span className="text-[#EE641D]">Dash</span><span className="text-[#121212]">Stack</span>
            </h1>
          </div>

          {/* Illustration */}
          <div className="relative w-full max-w-md aspect-square mb-12">
            <img
              src={illustration}
              alt="Auth Illustration"
              className="w-full h-full object-contain drop-shadow-2xl animate-float"
            />
          </div>

          {/* Tagline */}
          <div className="text-center space-y-4">
            {tagline || (
              <h2 className="text-xl font-bold text-gray-800 px-8 leading-tight">
                Connect,Collaborate and Control.<span className="text-[#EE641D]">Society Management Made Simple.</span>
              </h2>
            )}
            <div className="flex justify-center gap-2 mt-6">
              <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? "w-8 bg-[#EE641D]" : "w-4 bg-[#EE641D]/30"}`}></div>
              <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? "w-8 bg-[#EE641D]" : "w-4 bg-[#EE641D]/30"}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#fdfdfd]">
        {/* Blurred Background Pattern Layer */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-100 scale-105"
          style={{
            backgroundImage: `url(${pattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#fdfdfd'
          }}
        ></div>

        {/* Subtle Overlay Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-1 bg-[radial-gradient(#EE641D_0.5px,transparent_0.5px)] [background-size:20px_20px]"></div>

        <div className="w-full max-w-[630px] max-h-[90vh] bg-white rounded-3xl p-6 lg:p-10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 relative z-10 backdrop-blur-sm bg-white/95 flex flex-col justify-center overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
          {children}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0px); }
            }
             `
        }} />
      </div>
    </div>
  );
}
