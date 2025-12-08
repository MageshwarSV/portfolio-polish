// Portfolio data management utilities
import { experiences as defaultExperiences, projects as defaultProjects, skillCategories as defaultSkills, aboutContent as defaultAbout, personalInfo as defaultPersonalInfo, certifications as defaultCertifications, achievements as defaultAchievements, contactInfo as defaultContactInfo, socials as defaultSocials, chapters as defaultChapters, techStack as defaultTechStack } from '@/data/storytellingData';

const STORAGE_KEYS = {
  EXPERIENCES: 'portfolio_experiences',
  PROJECTS: 'portfolio_projects',
  SKILLS: 'portfolio_skills',
  ABOUT: 'portfolio_about',
  PERSONAL: 'portfolio_personal',
  CERTIFICATIONS: 'portfolio_certifications',
  ACHIEVEMENTS: 'portfolio_achievements',
  CONTACT: 'portfolio_contact',
  SOCIALS: 'portfolio_socials',
  CHAPTERS: 'portfolio_chapters',
  TECHSTACK: 'portfolio_techstack'
};

// Initialize data from storytellingData.ts if not exists
export const initializeData = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEYS.EXPERIENCES)) {
    localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(defaultExperiences));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(defaultProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SKILLS)) {
    // Save full skill categories structure
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(defaultSkills));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ABOUT)) {
    localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(defaultAbout));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PERSONAL)) {
    localStorage.setItem(STORAGE_KEYS.PERSONAL, JSON.stringify(defaultPersonalInfo));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(defaultCertifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(defaultAchievements));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTACT)) {
    // Strip icon property for contact info
    const contactWithoutIcons = defaultContactInfo.map(({ icon, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(contactWithoutIcons));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SOCIALS)) {
    // Strip icon property for socials
    const socialsWithoutIcons = defaultSocials.map(({ icon, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(socialsWithoutIcons));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(defaultChapters));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TECHSTACK)) {
    localStorage.setItem(STORAGE_KEYS.TECHSTACK, JSON.stringify(defaultTechStack));
  }
};

// Get data with automatic sorting and status updates
export const getExperiences = () => {
  if (typeof window === 'undefined') return defaultExperiences;
  
  const stored = localStorage.getItem(STORAGE_KEYS.EXPERIENCES);
  if (!stored) return defaultExperiences;
  
  const experiences = JSON.parse(stored);
  const currentYear = new Date().getFullYear();
  
  // Sort by year (newest first), update status, and map icons back
  return experiences
    .map((exp: any) => {
      const endYear = exp.period.includes('Present') ? currentYear : parseInt(exp.period.split('-')[1]?.trim() || currentYear);
      const status = exp.period.includes('Present') ? 'current' : 'completed';
      // Map icon back from default data
      const defaultExp = defaultExperiences.find(e => e.id === exp.id);
      return { ...exp, type: status, endYear, icon: defaultExp?.icon || defaultExperiences[0].icon };
    })
    .sort((a: any, b: any) => b.endYear - a.endYear);
};

export const saveExperiences = (data: any[]) => {
  // Remove icon property (React components can't be serialized)
  const experiencesWithoutIcons = data.map(({ icon, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEYS.EXPERIENCES, JSON.stringify(experiencesWithoutIcons));
};

export const getProjects = () => {
  if (typeof window === 'undefined') return defaultProjects;
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (!stored) return defaultProjects;
  
  const loadedProjects = JSON.parse(stored);
  // Map icons back from default data by matching project id
  return loadedProjects.map((project: any) => {
    const defaultProject = defaultProjects.find(p => p.id === project.id);
    return { ...project, icon: defaultProject?.icon || defaultProjects[0].icon };
  });
};

export const saveProjects = (data: any[]) => {
  // Remove icon property (React components can't be serialized)
  const projectsWithoutIcons = data.map(({ icon, ...rest }) => rest);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projectsWithoutIcons));
};

export const getSkills = () => {
  if (typeof window === 'undefined') return defaultSkills;
  const stored = localStorage.getItem(STORAGE_KEYS.SKILLS);
  if (!stored) return defaultSkills;
  
  // Return the full skill categories structure
  return JSON.parse(stored);
};

export const saveSkills = (data: any[]) => {
  // Save the full skill categories structure
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(data));
};

export const getAbout = () => {
  if (typeof window === 'undefined') return defaultAbout;
  const stored = localStorage.getItem(STORAGE_KEYS.ABOUT);
  if (!stored) return defaultAbout;
  
  const loadedAbout = JSON.parse(stored);
  // Map icons back to highlights if they exist
  if (loadedAbout.highlights && Array.isArray(loadedAbout.highlights)) {
    loadedAbout.highlights = loadedAbout.highlights.map((highlight: any, index: number) => {
      const defaultHighlight = defaultAbout.highlights[index];
      return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
    });
  }
  return loadedAbout;
};

export const saveAbout = (data: any) => {
  // Remove icon properties from highlights
  const aboutWithoutIcons = { ...data };
  if (aboutWithoutIcons.highlights) {
    aboutWithoutIcons.highlights = aboutWithoutIcons.highlights.map(({ icon, ...rest }: any) => rest);
  }
  localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(aboutWithoutIcons));
};

export const getPersonalInfo = () => {
  if (typeof window === 'undefined') return defaultPersonalInfo;
  const stored = localStorage.getItem(STORAGE_KEYS.PERSONAL);
  return stored ? JSON.parse(stored) : defaultPersonalInfo;
};

export const savePersonalInfo = (data: any) => {
  localStorage.setItem(STORAGE_KEYS.PERSONAL, JSON.stringify(data));
};

// Certifications
export const getCertifications = () => {
  if (typeof window === 'undefined') return defaultCertifications;
  const stored = localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS);
  if (!stored) return defaultCertifications;
  return JSON.parse(stored).sort((a: any, b: any) => b.year - a.year);
};

export const saveCertifications = (data: any) => {
  localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(data));
};

// Achievements
export const getAchievements = () => {
  if (typeof window === 'undefined') return defaultAchievements;
  const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (!stored) return defaultAchievements;
  return JSON.parse(stored).sort((a: any, b: any) => b.year - a.year);
};

export const saveAchievements = (data: any) => {
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data));
};

// Contact Info
export const getContactInfo = () => {
  if (typeof window === 'undefined') return defaultContactInfo;
  const stored = localStorage.getItem(STORAGE_KEYS.CONTACT);
  if (!stored) return defaultContactInfo;
  const contactData = JSON.parse(stored);
  // Map icons back from default data by label
  return contactData.map((contact: any) => {
    const defaultContact = defaultContactInfo.find(c => c.label === contact.label);
    return { ...contact, icon: defaultContact?.icon || defaultContactInfo[0].icon };
  });
};

export const saveContactInfo = (data: any) => {
  // Strip icons before saving
  const withoutIcons = data.map(({ icon, ...rest }: any) => rest);
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(withoutIcons));
};

// Social Links
export const getSocials = () => {
  if (typeof window === 'undefined') return defaultSocials;
  const stored = localStorage.getItem(STORAGE_KEYS.SOCIALS);
  if (!stored) return defaultSocials;
  const socialsData = JSON.parse(stored);
  // Map icons back from default data by label
  return socialsData.map((social: any) => {
    const defaultSocial = defaultSocials.find(s => s.label === social.label);
    return { ...social, icon: defaultSocial?.icon || defaultSocials[0].icon };
  });
};

export const saveSocials = (data: any) => {
  // Strip icons before saving
  const withoutIcons = data.map(({ icon, ...rest }: any) => rest);
  localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(withoutIcons));
};

// Navigation Chapters
export const getChapters = () => {
  if (typeof window === 'undefined') return defaultChapters;
  const stored = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
  return stored ? JSON.parse(stored) : defaultChapters;
};

export const saveChapters = (data: any) => {
  localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(data));
};

// Tech Stack
export const getTechStack = () => {
  if (typeof window === 'undefined') return defaultTechStack;
  const stored = localStorage.getItem(STORAGE_KEYS.TECHSTACK);
  return stored ? JSON.parse(stored) : defaultTechStack;
};

export const saveTechStack = (data: any) => {
  localStorage.setItem(STORAGE_KEYS.TECHSTACK, JSON.stringify(data));
};

// About Content (intro, story, highlights)
export const getAboutContent = () => {
  if (typeof window === 'undefined') return defaultAbout;
  const stored = localStorage.getItem(STORAGE_KEYS.ABOUT);
  if (!stored) return defaultAbout;
  const aboutData = JSON.parse(stored);
  // Map icons back from default data by title
  if (aboutData.highlights) {
    aboutData.highlights = aboutData.highlights.map((highlight: any) => {
      const defaultHighlight = defaultAbout.highlights.find((h: any) => h.title === highlight.title);
      return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
    });
  }
  return aboutData;
};

export const saveAboutContent = (data: any) => {
  // Strip icons from highlights before saving
  const dataToSave = {
    ...data,
    highlights: data.highlights?.map(({ icon, ...rest }: any) => rest) || []
  };
  localStorage.setItem(STORAGE_KEYS.ABOUT, JSON.stringify(dataToSave));
};

// Delete all portfolio data and reinitialize with defaults
export const deleteAllData = () => {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Reinitialize with default data
  initializeData();
};
