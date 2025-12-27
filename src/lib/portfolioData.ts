// Portfolio data management utilities using Firebase Firestore
import {
  experiences as defaultExperiences,
  projects as defaultProjects,
  skillCategories as defaultSkills,
  aboutContent as defaultAbout,
  personalInfo as defaultPersonalInfo,
  certifications as defaultCertifications,
  achievements as defaultAchievements,
  contactInfo as defaultContactInfo,
  socials as defaultSocials,
  chapters as defaultChapters,
  techStack as defaultTechStack
} from '@/data/storytellingData';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'portfolio';
const DOCUMENT_ID = 'global_data';

// Initialize data from storytellingData.ts to Firestore if not exists
export const initializeData = async () => {
  if (typeof window === 'undefined') return;

  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log('Initializing Firestore with default content...');
      // Strip icons before saving to Firestore
      const contactWithoutIcons = defaultContactInfo.map(({ icon, ...rest }) => rest);
      const socialsWithoutIcons = defaultSocials.map(({ icon, ...rest }) => rest);
      const experiencesWithoutIcons = defaultExperiences.map(({ icon, ...rest }) => rest);
      const projectsWithoutIcons = defaultProjects.map(({ icon, ...rest }) => rest);
      const aboutWithoutIcons = {
        ...defaultAbout,
        highlights: defaultAbout.highlights.map(({ icon, ...rest }) => rest)
      };

      await setDoc(docRef, {
        experiences: experiencesWithoutIcons,
        projects: projectsWithoutIcons,
        skills: defaultSkills,
        about: aboutWithoutIcons,
        personal: defaultPersonalInfo,
        certifications: defaultCertifications,
        achievements: defaultAchievements,
        contact: contactWithoutIcons,
        socials: socialsWithoutIcons,
        chapters: defaultChapters,
        techstack: defaultTechStack,
        last_update: Date.now()
      });
      console.log('Firestore initialized successfully.');
    }
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};

// Generic getter and setter for Firestore data
const getData = async (key: string, defaultValue: any) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data()[key] || defaultValue;
    }
  } catch (error) {
    console.error(`Error getting ${key} from Firestore:`, error);
  }
  return defaultValue;
};

const CACHE_KEY = 'portfolio_data_cache';

const saveData = async (key: string, data: any) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    await updateDoc(docRef, {
      [key]: data,
      last_update: Date.now()
    });

    // Sync local manual cache for instant loading on next refresh
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const fullData = cached ? JSON.parse(cached) : {};
      fullData[key] = data;
      localStorage.setItem(CACHE_KEY, JSON.stringify(fullData));
    } catch (e) {
      console.warn('Failed to sync local cache on save:', e);
    }

    // Trigger local events for compatibility
    localStorage.setItem('portfolio_last_update', Date.now().toString());
    window.dispatchEvent(new CustomEvent('portfolio_data_updated'));
  } catch (error) {
    console.error(`Error saving ${key} to Firestore:`, error);
  }
};

// Get data with automatic sorting and status updates
export const getExperiences = async () => {
  const experiences = await getData('experiences', defaultExperiences);
  const currentYear = new Date().getFullYear();

  return experiences
    .map((exp: any) => {
      const endYear = exp.period.includes('Present') ? currentYear : parseInt(exp.period.split('-')[1]?.trim() || currentYear);
      const status = exp.period.includes('Present') ? 'current' : 'completed';
      const defaultExp = defaultExperiences.find(e => e.id === exp.id);
      return { ...exp, type: status, endYear, icon: defaultExp?.icon || defaultExperiences[0].icon };
    })
    .sort((a: any, b: any) => b.endYear - a.endYear);
};

export const saveExperiences = async (data: any[]) => {
  const experiencesWithoutIcons = data.map(({ icon, ...rest }) => rest);
  await saveData('experiences', experiencesWithoutIcons);
};

export const getProjects = async () => {
  const loadedProjects = await getData('projects', defaultProjects);
  return loadedProjects.map((project: any) => {
    const defaultProject = defaultProjects.find(p => p.id === project.id);
    return { ...project, icon: defaultProject?.icon || defaultProjects[0].icon };
  });
};

export const saveProjects = async (data: any[]) => {
  const projectsWithoutIcons = data.map(({ icon, ...rest }) => rest);
  await saveData('projects', projectsWithoutIcons);
};

export const getSkills = async () => {
  return await getData('skills', defaultSkills);
};

export const saveSkills = async (data: any[]) => {
  await saveData('skills', data);
};

export const getAbout = async () => {
  const loadedAbout = await getData('about', defaultAbout);
  if (loadedAbout.highlights && Array.isArray(loadedAbout.highlights)) {
    loadedAbout.highlights = loadedAbout.highlights.map((highlight: any, index: number) => {
      const defaultHighlight = defaultAbout.highlights[index];
      return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
    });
  }
  return loadedAbout;
};

export const saveAbout = async (data: any) => {
  const aboutWithoutIcons = { ...data };
  if (aboutWithoutIcons.highlights) {
    aboutWithoutIcons.highlights = aboutWithoutIcons.highlights.map(({ icon, ...rest }: any) => rest);
  }
  await saveData('about', aboutWithoutIcons);
};

export const getPersonalInfo = async () => {
  return await getData('personal', defaultPersonalInfo);
};

export const savePersonalInfo = async (data: any) => {
  await saveData('personal', data);
};

export const getCertifications = async () => {
  const certs = await getData('certifications', defaultCertifications);
  return certs.sort((a: any, b: any) => b.year - a.year);
};

export const saveCertifications = async (data: any) => {
  await saveData('certifications', data);
};

export const getAchievements = async () => {
  const achievements = await getData('achievements', defaultAchievements);
  return achievements.sort((a: any, b: any) => b.year - a.year);
};

export const saveAchievements = async (data: any) => {
  await saveData('achievements', data);
};

export const getContactInfo = async () => {
  const contactData = await getData('contact', defaultContactInfo);
  return contactData.map((contact: any) => {
    const defaultContact = defaultContactInfo.find(c => c.label === contact.label);
    return { ...contact, icon: defaultContact?.icon || defaultContactInfo[0].icon };
  });
};

export const saveContactInfo = async (data: any) => {
  const withoutIcons = data.map(({ icon, ...rest }: any) => rest);
  await saveData('contact', withoutIcons);
};

export const getSocials = async () => {
  const socialsData = await getData('socials', defaultSocials);
  return socialsData.map((social: any) => {
    const defaultSocial = defaultSocials.find(s => s.label === social.label);
    return { ...social, icon: defaultSocial?.icon || defaultSocials[0].icon };
  });
};

export const saveSocials = async (data: any) => {
  const withoutIcons = data.map(({ icon, ...rest }: any) => rest);
  await saveData('socials', withoutIcons);
};

export const getChapters = async () => {
  return await getData('chapters', defaultChapters);
};

export const saveChapters = async (data: any) => {
  await saveData('chapters', data);
};

export const getTechStack = async () => {
  return await getData('techstack', defaultTechStack);
};

export const saveTechStack = async (data: any) => {
  await saveData('techstack', data);
};

export const getAboutContent = async () => {
  const aboutData = await getData('about', defaultAbout);
  if (aboutData.highlights) {
    aboutData.highlights = aboutData.highlights.map((highlight: any) => {
      const defaultHighlight = defaultAbout.highlights.find((h: any) => h.title === highlight.title);
      return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
    });
  }
  return aboutData;
};

export const saveAboutContent = async (data: any) => {
  const dataToSave = {
    ...data,
    highlights: data.highlights?.map(({ icon, ...rest }: any) => rest) || []
  };
  await saveData('about', dataToSave);
};

export const deleteAllData = async () => {
  if (typeof window === 'undefined') return;
  // We don't usually delete global Firestore data this way, but if needed:
  const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
  await setDoc(docRef, {});
  await initializeData();
};

