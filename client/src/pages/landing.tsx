import { Shield, Lock, Mail, Phone, Globe, Eye, Zap, Database } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  }
};

const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Landing() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0b0f14' }}>
      {/* Navbar */}
      <motion.nav 
        className="relative z-10 py-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-2">
            <h1 
              className="font-bold tracking-tight text-[50px]"
              style={{ color: '#00B5FF' }}
            >
              DarkTrack
            </h1>
            <p className="text-sm text-gray-400 ml-[0px] mr-[0px] mt-[0px] mb-[0px]">
              Know your exposure. Secure it fast.
            </p>
          </div>
        </div>
      </motion.nav>
      {/* Main Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Content */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Protect your digital identity with{" "}
                <span style={{ color: '#00B5FF' }}>DarkTrack</span>
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                AI-powered OSINT analysis that reveals your digital exposure across the internet. 
                Get real-time breach detection, comprehensive scanning, and actionable insights to 
                protect your online presence from threats.
              </p>
            </motion.div>

            {/* Primary Actions */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-semibold transition-all hover:scale-105 hover:shadow-xl"
                style={{ 
                  backgroundColor: '#00B5FF',
                  color: '#0b0f14',
                  border: 'none'
                }}
                data-testid="button-login"
              >
                <a href="/api/login">
                  <Lock className="h-5 w-5 mr-2" />
                  Login
                </a>
              </Button>
              
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-semibold transition-all hover:scale-105 border-2"
                style={{ 
                  borderColor: '#00B5FF',
                  color: '#00B5FF',
                  backgroundColor: 'transparent'
                }}
                data-testid="button-signup"
              >
                <a href="/api/login">
                  <Shield className="h-5 w-5 mr-2" />
                  Sign Up
                </a>
              </Button>
            </motion.div>

            {/* Social Auth Options */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <p className="text-sm text-gray-500">Continue with:</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-6 transition-all hover:scale-105 border"
                  style={{ 
                    borderColor: '#1f2937',
                    backgroundColor: '#111827',
                    color: '#9ca3af'
                  }}
                  data-testid="button-google-auth"
                >
                  <a href="/api/login">
                    <SiGoogle className="h-4 w-4 mr-2" />
                    Google
                  </a>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-6 transition-all hover:scale-105 border"
                  style={{ 
                    borderColor: '#1f2937',
                    backgroundColor: '#111827',
                    color: '#9ca3af'
                  }}
                  data-testid="button-email-auth"
                >
                  <a href="/api/login">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
                
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-6 transition-all hover:scale-105 border"
                  style={{ 
                    borderColor: '#1f2937',
                    backgroundColor: '#111827',
                    color: '#9ca3af'
                  }}
                  data-testid="button-phone-auth"
                >
                  <a href="/api/login">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </a>
                </Button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Illustration */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={scaleIn}
          >
            <div className="relative w-full max-w-lg">
              {/* Animated Background Glow */}
              <motion.div
                className="absolute inset-0 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: '#00B5FF' }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main Shield Icon */}
              <motion.div
                className="relative z-10 flex items-center justify-center"
                variants={float}
                animate="animate"
              >
                <div 
                  className="rounded-full p-12"
                  style={{ 
                    backgroundColor: 'rgba(0, 181, 255, 0.1)',
                    border: '2px solid rgba(0, 181, 255, 0.3)'
                  }}
                >
                  <Shield 
                    className="w-48 h-48"
                    style={{ color: '#00B5FF' }}
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>

              {/* Floating Icons */}
              <motion.div
                className="absolute top-10 right-10"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div 
                  className="rounded-lg p-3"
                  style={{ 
                    backgroundColor: 'rgba(0, 181, 255, 0.15)',
                    border: '1px solid rgba(0, 181, 255, 0.3)'
                  }}
                >
                  <Eye className="w-8 h-8" style={{ color: '#00B5FF' }} />
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-20 left-10"
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
              >
                <div 
                  className="rounded-lg p-3"
                  style={{ 
                    backgroundColor: 'rgba(0, 181, 255, 0.15)',
                    border: '1px solid rgba(0, 181, 255, 0.3)'
                  }}
                >
                  <Globe className="w-8 h-8" style={{ color: '#00B5FF' }} />
                </div>
              </motion.div>

              <motion.div
                className="absolute top-1/2 left-0"
                animate={{
                  y: [0, -10, 0],
                  x: [-5, 5, -5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3
                }}
              >
                <div 
                  className="rounded-lg p-3"
                  style={{ 
                    backgroundColor: 'rgba(0, 181, 255, 0.15)',
                    border: '1px solid rgba(0, 181, 255, 0.3)'
                  }}
                >
                  <Zap className="w-8 h-8" style={{ color: '#00B5FF' }} />
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-10 right-20"
                animate={{
                  y: [0, -13, 0],
                  rotate: [0, 8, 0]
                }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              >
                <div 
                  className="rounded-lg p-3"
                  style={{ 
                    backgroundColor: 'rgba(0, 181, 255, 0.15)',
                    border: '1px solid rgba(0, 181, 255, 0.3)'
                  }}
                >
                  <Database className="w-8 h-8" style={{ color: '#00B5FF' }} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      {/* Footer */}
      <motion.footer
        className="relative z-10 py-6 border-t"
        style={{ borderColor: '#1f2937' }}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} DarkTrack — Built for privacy.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
