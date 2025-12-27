import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Sparkles, Check, AlertCircle, Loader2, MessageCircle, User, Bot, Github, Linkedin, Twitter, Instagram, Youtube, Globe, Facebook, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactInfo as defaultContactInfo, socials as defaultSocials, personalInfo as defaultPersonalInfo } from "@/data/storytellingData";
import { usePortfolio } from "@/contexts/PortfolioContext";
import emailjs from "@emailjs/browser";

// Icon mapping for Firebase data (stored as strings)
const iconMap: { [key: string]: any } = {
  Github, Linkedin, Twitter, Instagram, Youtube, Globe, Facebook, Mail, Phone,
  github: Github, linkedin: Linkedin, twitter: Twitter, instagram: Instagram,
  youtube: Youtube, globe: Globe, facebook: Facebook, mail: Mail, phone: Phone
};

const getIcon = (social: any) => {
  // 1. Try explicit icon name (stored as string)
  if (social.icon && typeof social.icon === 'string') {
    return iconMap[social.icon] || iconMap[social.icon.toLowerCase()];
  }
  // 2. Fallback: Try matching the Label (e.g. "GitHub" -> Github icon)
  if (social.label) {
    const cleanLabel = social.label.trim();
    return iconMap[cleanLabel] || iconMap[cleanLabel.toLowerCase()];
  }
  // 3. Last resort: specific check for React component (legacy data)
  if (social.icon && typeof social.icon !== 'string') {
    return social.icon;
  }

  return Globe;
};

// EmailJS Configuration - Connected to mageshwar.offic@gmail.com
const EMAILJS_SERVICE_ID = "service_aynrf47";
const EMAILJS_TEMPLATE_ID = "template_j53xky4";
const EMAILJS_PUBLIC_KEY = "xF9Mfy6lITPFqxzjc";

type FormStatus = "idle" | "sending" | "success" | "error";

// Chat Message Component
const ChatMessage = ({
  isBot,
  message,
  delay = 0
}: {
  isBot: boolean;
  message: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.3, delay: delay / 1000 }}
    className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isBot ? "bg-primary/20" : "bg-accent/20"
      }`}>
      {isBot ? (
        <Bot className="w-4 h-4 text-primary" />
      ) : (
        <User className="w-4 h-4 text-accent" />
      )}
    </div>
    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${isBot
      ? "bg-secondary/50 rounded-tl-none"
      : "bg-primary text-primary-foreground rounded-tr-none"
      }`}>
      <p className="text-sm">{message}</p>
    </div>
  </motion.div>
);

// Chat Interface Style Contact Section
const StoryContact = () => {
  const { data: portfolioData } = usePortfolio();
  const ref = useRef(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [chatStarted, setChatStarted] = useState(false);

  // Use data from portfolio context
  const personalInfo = portfolioData?.personal || defaultPersonalInfo;
  const socials = portfolioData?.socials || defaultSocials;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all fields");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: "mageshwar.offic@gmail.com",
          reply_to: formData.email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again.");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section ref={ref} id="contact" className="relative py-24 overflow-hidden">
      <div className="container-custom">
        {/* Chapter header */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-primary font-display text-5xl md:text-6xl font-bold opacity-20">05</span>
          <div>
            <span className="text-primary text-sm uppercase tracking-widest">Chapter Five</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Let's Connect</h2>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            {/* Chat Window */}
            <div className="rounded-3xl overflow-hidden border border-border/50 bg-background shadow-xl">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 bg-secondary/30 border-b border-border/30">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Mageshwar S.V</h3>
                  <span className="text-xs text-green-500">● Online now</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                <ChatMessage
                  isBot
                  message="Hey there! 👋 I'm Mageshwar. Thanks for visiting my portfolio!"
                  delay={0}
                />
                <ChatMessage
                  isBot
                  message="I specialize in AI automation, IoT solutions, and full-stack development. How can I help you today?"
                  delay={300}
                />

                {chatStarted && formData.name && (
                  <ChatMessage
                    isBot={false}
                    message={`Hi! I'm ${formData.name}. ${formData.message || "I'd like to discuss a project."}`}
                    delay={100}
                  />
                )}

                {status === "success" && (
                  <ChatMessage
                    isBot
                    message="Got it! 🎉 I've received your message and will get back to you soon. Talk to you later!"
                    delay={200}
                  />
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-3">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {["Hire me", "Collaborate", "Say hello", "Ask about projects"].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, message: action }));
                        setChatStarted(true);
                      }}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mt-6">
              {socials.map((social: any) => {
                const IconComponent = getIcon(social);
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.1 }}
                    className="w-12 h-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all"
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Send a Message</h3>
                  <p className="text-xs text-muted-foreground">I'll respond within 24 hours</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setChatStarted(true);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Your name"
                    required
                    disabled={status === "sending"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="your@email.com"
                    required
                    disabled={status === "sending"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                    required
                    disabled={status === "sending"}
                  />
                </div>

                {/* Status Messages */}
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Message sent successfully!
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full h-12 text-base font-medium group"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Send Message
                      <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </Button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-border/30 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  Or reach me directly at{" "}
                  <a href={`mailto:${personalInfo.email}`} className="text-primary hover:underline">
                    {personalInfo.email}
                  </a>
                </p>
                <div className="flex justify-center">
                  <a
                    href="tel:+918122715213"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 8122715213
                  </a>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StoryContact;
