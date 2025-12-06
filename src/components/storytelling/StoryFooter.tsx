import { motion } from "framer-motion";
import { Heart, ArrowUp, Github, Linkedin, Mail, Terminal } from "lucide-react";
import { personalInfo, socials } from "@/data/storytellingData";

const StoryFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Journey", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Work", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="relative border-t border-border/50 bg-background/50 backdrop-blur-sm">
      {/* Main Footer Content */}
      <div className="container-custom py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Terminal className="w-5 h-5 text-background" />
              </div>
              <span className="font-display text-2xl font-bold text-gradient">
                Mageshwar S.V
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Software Engineer & AI Automation Developer crafting intelligent workflow systems
              and IoT solutions that transform how businesses operate.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socials.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
              <motion.a
                href={`mailto:${personalInfo.email}`}
                whileHover={{ y: -3, scale: 1.05 }}
                className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {personalInfo.email}
                </a>
              </li>
              <li>
                <a
                  href="tel:+918122715213"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  +91 8122715213
                </a>
              </li>
              <li className="text-muted-foreground">
                {personalInfo.location}
              </li>
              <li>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Available for work
                </span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm text-muted-foreground flex items-center gap-1"
            >
              © {currentYear} Mageshwar S.V. Made with
              <Heart className="w-3 h-3 text-primary fill-primary animate-pulse" />
              in Chennai, India
            </motion.p>

            {/* Back to Top */}
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary hover:bg-primary/20 transition-all group"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              Back to top
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoryFooter;
