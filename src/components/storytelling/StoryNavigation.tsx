import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { chapters as defaultChapters } from "@/data/storytellingData";
import { getChapters, initializeData } from "@/lib/portfolioData";

const StoryNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [chapters, setChapters] = useState(defaultChapters);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let lastUpdate = localStorage.getItem('portfolio_last_update');

    const loadData = () => {
      try {
        initializeData();
        const loadedChapters = getChapters();
        if (loadedChapters && loadedChapters.length > 0) {
          setChapters(loadedChapters);
        }
      } catch (error) {
        console.error('Error loading chapters:', error);
      }
    };

    loadData();

    const pollInterval = setInterval(() => {
      const currentUpdate = localStorage.getItem('portfolio_last_update');
      if (currentUpdate !== lastUpdate) {
        lastUpdate = currentUpdate;
        loadData();
      }
    }, 300);

    const handleUpdate = () => loadData();
    window.addEventListener('portfolio_data_updated', handleUpdate);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('portfolio_data_updated', handleUpdate);
    };
  }, []);

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = chapters.map(c => document.getElementById(c.id));
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section, index) => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(chapters[index].id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ opacity: 1 }}
      >
        <motion.div
          className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50"
          style={{ opacity: backgroundOpacity }}
        />

        <nav className="container-custom relative">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("hero");
              }}
              className="font-display text-2xl font-bold text-gradient whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
            >
              S V
            </motion.a>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {chapters.slice(1).map((chapter) => (
                <motion.button
                  key={chapter.id}
                  onClick={() => scrollToSection(chapter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${activeSection === chapter.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xs text-primary/50 mr-1">{chapter.number}.</span>
                  {chapter.label}
                  {activeSection === chapter.id && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none"
        }}
        className="fixed inset-0 z-40 md:hidden"
      >
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setIsOpen(false)} />

        <motion.nav
          initial={false}
          animate={{ y: isOpen ? 0 : -20 }}
          className="relative pt-24 px-6"
        >
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <motion.button
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isOpen ? 1 : 0,
                  x: isOpen ? 0 : -20
                }}
                transition={{ delay: index * 0.05 }}
                onClick={() => scrollToSection(chapter.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors ${activeSection === chapter.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
              >
                <span className="text-xs text-primary/50 font-mono">{chapter.number}</span>
                <span className="font-medium">{chapter.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.nav>
      </motion.div>

      {/* Progress Indicator (Side) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {chapters.map((chapter) => (
          <motion.button
            key={chapter.id}
            onClick={() => scrollToSection(chapter.id)}
            className="group flex items-center gap-3"
            whileHover={{ x: -5 }}
          >
            <span className={`text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity ${activeSection === chapter.id ? "text-primary" : "text-muted-foreground"
              }`}>
              {chapter.number}
            </span>
            <div className={`w-2 h-2 rounded-full transition-all ${activeSection === chapter.id
              ? "bg-primary scale-125"
              : "bg-muted-foreground/30 group-hover:bg-muted-foreground"
              }`} />
          </motion.button>
        ))}
      </div>
    </>
  );
};

export default StoryNavigation;
