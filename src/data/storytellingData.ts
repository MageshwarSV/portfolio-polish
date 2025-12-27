// Complete Portfolio Data with Scroll Animation Support
// Updated with full user details from scanned folder

import { Code2, Bot, Cpu, Workflow, Briefcase, Rocket, Globe, Award, Shield, Home, ShoppingBag, Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";

// Personal information
export const personalInfo = {
    name: "Mageshwar S.V",
    firstName: "Mageshwar",
    title: "Software Engineer & AI Automation Developer",
    tagline: "Building impactful tech solutions with AI, Automation & IoT",
    email: "mageshwar.offic@gmail.com",
    phone: "+91 8122715213",
    location: "Chennai, India",
    linkedin: "https://linkedin.com/in/mageshwar-avinash",
    github: "https://github.com/MageshwarSV",
    profileImage: "/assets/profile.jpg",
    education: "B.Tech IT Student",
    currentCompany: "WorkBooster AI",
    badgeText: "AI Automation Expert @",
    badgeColor: "primary", // Options: 'primary' (Green) or 'accent' (Blue)
};

// About section with intro paragraphs for storytelling
export const aboutContent = {
    intro: "I am a passionate Software Engineer specializing in Web Development, Automation, IoT, and AI-powered workflow systems.",
    story: [
        "My journey began with curiosity about how things work, leading me deep into software development, AI, and embedded systems.",
        "Currently at WorkBooster AI, I architect automation pipelines that save businesses countless hours.",
        "From smart agriculture systems to AI-powered security solutions, I love building technology that makes a real-world impact."
    ],
    highlights: [
        { icon: Code2, title: "Full-Stack Development", description: "Building responsive web apps with modern frameworks", stat: "3+ Years" },
        { icon: Bot, title: "AI Automation", description: "Creating intelligent workflows with n8n & Flowise", stat: "90% Efficiency" },
        { icon: Cpu, title: "IoT Solutions", description: "Hardware meets software for smart systems", stat: "5+ Projects" },
        { icon: Workflow, title: "Process Optimization", description: "Reducing manual work through automation", stat: "10K+ Hours Saved" },
    ],
};

// Experience for horizontal timeline
export const experiences = [
    {
        id: 1,
        title: "Software & Automation Engineer",
        company: "WorkBooster AI",
        period: "2025 – Present",
        type: "current",
        icon: Rocket,
        description: "Leading AI automation initiatives and building intelligent workflow systems.",
        highlights: [
            "Architecting n8n automation workflows for enterprise clients",
            "Designing AI-based automation pipelines with 90% efficiency gains",
            "Building the Booster Entry document automation system",
            "Integrating APIs, AI models, and databases for seamless operations",
        ],
        color: "primary",
    },
    {
        id: 2,
        title: "Web Development Intern",
        company: "Branups",
        period: "2025",
        type: "ongoing",
        icon: Globe,
        description: "Developing responsive, modern websites for diverse clients.",
        highlights: [
            "Creating responsive WordPress sites",
            "Implementing modern UI components with JavaScript",
            "Optimizing for performance and SEO",
        ],
        color: "accent",
    },
    {
        id: 3,
        title: "Web Development Intern",
        company: "Tecvesten Consulting LLP",
        period: "2025",
        type: "completed",
        icon: Briefcase,
        description: "Built professional business websites using Zoho Sites.",
        highlights: [
            "Custom scripts and layouts",
            "Mobile-optimized designs",
            "Client requirement analysis",
        ],
        color: "primary",
    },
    {
        id: 4,
        title: "Team Lead — Smart India Hackathon",
        company: "SIH 2022-2024",
        period: "2022 – 2024",
        type: "achievement",
        icon: Award,
        description: "Led teams for two major national-level hackathon projects.",
        highlights: [
            "Smart Pipeline Leakage Detection (IoT)",
            "Women Safety Analytics (AI + Mobile)",
            "Designed sensor architecture & threat detection systems",
        ],
        color: "accent",
    },
];

// Skills with levels for animated progress
export const skillCategories = [
    {
        title: "Programming ",
        color: "primary",
        skills: [
            { name: "Python", level: 95, icon: "🐍" },
            { name: "Java", level: 85, icon: "☕" },
            { name: "JavaScript", level: 90, icon: "⚡" },
            { name: "TypeScript", level: 85, icon: "📘" },
            { name: "React", level: 85, icon: "⚛️" },
            { name: "C", level: 80, icon: "⚙️" },
        ],
    },
    {
        title: "Automation & AI",
        color: "accent",
        skills: [
            { name: "n8n", level: 95, icon: "🔄" },
            { name: "Flowise", level: 88, icon: "🌊" },
            { name: "API Integration", level: 92, icon: "🔗" },
            { name: "Chatbot Dev", level: 85, icon: "🤖" },
            { name: "Process Automation", level: 90, icon: "⚡" },
            { name: "Micro SaaS", level: 80, icon: "🚀" },
        ],
    },
    {
        title: "IoT & Hardware",
        color: "primary",
        skills: [
            { name: "Arduino", level: 90, icon: "🔌" },
            { name: "ESP32/ESP8266", level: 88, icon: "📡" },
            { name: "Sensor Integration", level: 85, icon: "📊" },
            { name: "Dashboards", level: 82, icon: "📈" },
            { name: "Basic Electronics", level: 75, icon: "⚡" },
        ],
    },
    {
        title: "Web & Tools",
        color: "accent",
        skills: [
            { name: "React", level: 85, icon: "⚛️" },
            { name: "HTML/CSS", level: 95, icon: "🎨" },
            { name: "WordPress", level: 88, icon: "📝" },
            { name: "Git", level: 85, icon: "🔀" },
            { name: "Docker", level: 75, icon: "🐳" },
            { name: "Cloud (Basic)", level: 70, icon: "☁️" },
        ],
    },
];

// Projects with categories for filtering
export const projects = [
    {
        id: 1,
        title: "AGRISENSE",
        subtitle: "Smart Agriculture Monitoring System",
        description: "A smart agriculture system designed to help farmers with automated irrigation and real-time farm monitoring. Prevents water wastage and supports greenhouse, open field, or terrace farms.",
        icon: Cpu,
        tags: ["IoT", "ESP8266", "Sensors", "Cloud Dashboard"],
        features: [
            "Soil moisture, temperature, humidity monitoring",
            "Automatic irrigation using threshold detection",
            "Cloud dashboard with live farm stats",
        ],
        color: "primary",
        featured: true,
        category: "iot",
    },
    {
        id: 2,
        title: "Booster Entry",
        subtitle: "AI Document Automation System",
        description: "A fully automated data-entry system for businesses that extracts data from invoices, bills, and forms using AI, reducing 90% of manual entry work.",
        icon: Bot,
        tags: ["n8n", "AI", "API Integration", "Automation"],
        features: [
            "AI-powered data extraction",
            "Auto-saves to ERP/CRM systems",
            "Error-proof with human-in-loop option",
        ],
        color: "accent",
        featured: true,
        category: "ai",
    },
    {
        id: 3,
        title: "Women Safety Analytics",
        subtitle: "AI-Powered Security System",
        description: "An AI surveillance system with YOLO-based threat detection, gesture-based SOS triggers, and Smart Response Unit integration. Built for Smart India Hackathon 2024.",
        icon: Shield,
        tags: ["Python", "YOLO", "Mobile App", "Maps"],
        features: [
            "Real-time threat detection",
            "SOS gesture recognition",
            "Hotspot monitoring & mapping",
        ],
        color: "primary",
        featured: true,
        category: "ai",
    },
    {
        id: 4,
        title: "Smart Home Automation",
        subtitle: "Complete IoT Solution",
        description: "A comprehensive IoT solution featuring smart door locks, appliance control, thief alert systems, and mobile app integration.",
        icon: Home,
        tags: ["Arduino", "ESP32", "Mobile App", "IoT"],
        features: [
            "Smart door lock with fingerprint",
            "Voice-controlled appliances",
            "Intrusion detection alerts",
        ],
        color: "accent",
        featured: false,
        category: "iot",
    },
    {
        id: 5,
        title: "Shoe E-Commerce",
        subtitle: "Responsive Web Frontend",
        description: "A fully responsive UI for an online shoe store with modern design patterns and smooth animations.",
        icon: ShoppingBag,
        tags: ["HTML", "CSS", "JavaScript", "Responsive"],
        features: [
            "Product catalog with filters",
            "Shopping cart functionality",
            "Mobile-first design",
        ],
        color: "primary",
        featured: false,
        category: "web",
    },
];

// Contact info
export const contactInfo = [
    { icon: Mail, label: "Email", value: "mageshwar.offic@gmail.com", href: "mailto:mageshwar.offic@gmail.com" },
    { icon: Phone, label: "Phone", value: "+91 8122715213", href: "tel:+918122715213" },
    { icon: MapPin, label: "Location", value: "Chennai, India", href: null },
];

export const socials = [
    { icon: Github, href: "https://github.com/MageshwarSV", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/mageshwar-avinash", label: "LinkedIn" },
];

// Navigation chapters for scroll
export const chapters = [
    { id: "hero", label: "Home", number: "00" },
    { id: "about", label: "About", number: "01" },
    { id: "experience", label: "Journey", number: "02" },
    { id: "skills", label: "Skills", number: "03" },
    { id: "projects", label: "Work", number: "04" },
    { id: "contact", label: "Contact", number: "05" },
];

// Certifications (Coding/Technical)
export const certifications = [
    { title: "Python Programming", issuer: "GUVI", year: 2023 },
    { title: "IoT & AI Certification", issuer: "Pantech", year: 2023 },
    { title: "Ethical Hacking", issuer: "Udemy", year: 2023 },
    { title: "Java Programming", issuer: "IIT Bombay", year: 2022 },
];

// Achievements Unlocked (Competition Wins)
export const achievements = [
    { title: "Project Expo - 1st Place", issuer: "Kings Engineering College", year: 2022 },
    { title: "Project Hackathon - 1st Rank", issuer: "Kings Engineering College", year: 2022 },
    { title: "Poster Expo - 2nd Prize", issuer: "IMPULSE 2022", year: 2022 },
    { title: "Circuit Debugging - Runner Up", issuer: "IMPULSE 2023", year: 2023 },
    { title: "Paper Presentation - 3rd Place", issuer: "IMPULSE 2023", year: 2023 },
];

// Tech stack for floating animation
export const techStack = [
    "Python", "n8n", "React", "JavaScript", "Arduino", "ESP32",
    "AI/ML", "IoT", "Flowise", "WordPress", "Java", "TypeScript"
];

// Re-export for backwards compatibility
export const highlights = aboutContent.highlights;
