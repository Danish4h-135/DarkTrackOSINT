import { Shield, Lock, Eye, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
      delay: 0.3
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.8 + custom * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="w-full max-w-md p-8 space-y-8 overflow-hidden">
            <div className="text-center space-y-4">
              <motion.div 
                className="flex justify-center"
                variants={iconVariants}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold tracking-tight">DarkTrack</h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Secure Your Digital Footprint
                </p>
              </motion.div>
              
              <motion.p 
                className="text-sm text-muted-foreground"
                variants={itemVariants}
              >
                AI-powered OSINT analysis that reveals your digital exposure across the internet. 
                Get actionable insights to protect your online presence.
              </motion.p>
            </div>

            <motion.div 
              className="space-y-3"
              variants={itemVariants}
            >
              <Button 
                asChild 
                className="w-full h-12 text-base transition-all hover:scale-105 hover:shadow-lg"
                data-testid="button-login"
              >
                <a href="/api/login">
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In to Continue
                </a>
              </Button>
            </motion.div>

            <motion.div 
              className="grid grid-cols-3 gap-4 pt-4 border-t"
              variants={itemVariants}
            >
              <motion.div 
                className="text-center space-y-2"
                custom={0}
                variants={featureVariants}
              >
                <div className="flex justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Breach Detection
                </p>
              </motion.div>
              <motion.div 
                className="text-center space-y-2"
                custom={1}
                variants={featureVariants}
              >
                <div className="flex justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  AI Analysis
                </p>
              </motion.div>
              <motion.div 
                className="text-center space-y-2"
                custom={2}
                variants={featureVariants}
              >
                <div className="flex justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  OSINT Scanning
                </p>
              </motion.div>
            </motion.div>

            <motion.p 
              className="text-xs text-center text-muted-foreground pt-4 border-t"
              variants={itemVariants}
            >
              DarkTrack uses only public data sources and does not access private information.
            </motion.p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
