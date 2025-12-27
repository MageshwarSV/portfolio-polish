// Portfolio data management utilities using Firebase Realtime Database
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
import { ref, get, set, update } from 'firebase/database';

const DATA_PATH = 'portfolio';

// Initialize data from storytellingData.ts to Realtime Database if missing
export const initializeData = async () => {
  if (typeof window === 'undefined') return;

  try {
    const dataRef = ref(db, DATA_PATH);
    const snapshot = await get(dataRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    const contactWithoutIcons = defaultContactInfo.map(({ icon, ...rest }) => rest);
    const socialsWithoutIcons = defaultSocials.map(({ icon, ...rest }) => rest);
    const experiencesWithoutIcons = defaultExperiences.map(({ icon, ...rest }) => rest);
    const projectsWithoutIcons = defaultProjects.map(({ icon, ...rest }) => rest);
    const aboutWithoutIcons = {
      ...defaultAbout,
      highlights: defaultAbout.highlights.map(({ icon, ...rest }) => rest)
    };

    const newData: any = { ...existingData };
    let hasChanges = false;

    const isMissing = (val: any) => !val || (Array.isArray(val) && val.length === 0);

    if (isMissing(existingData.experiences)) { newData.experiences = experiencesWithoutIcons; hasChanges = true; }
    if (isMissing(existingData.projects)) { newData.projects = projectsWithoutIcons; hasChanges = true; }
    if (isMissing(existingData.skills)) { newData.skills = defaultSkills; hasChanges = true; }
    if (isMissing(existingData.about)) { newData.about = aboutWithoutIcons; hasChanges = true; }
    if (isMissing(existingData.personal)) { newData.personal = defaultPersonalInfo; hasChanges = true; }
    if (isMissing(existingData.certifications)) { newData.certifications = defaultCertifications; hasChanges = true; }
    if (isMissing(existingData.achievements)) { newData.achievements = defaultAchievements; hasChanges = true; }
    if (isMissing(existingData.contact)) { newData.contact = contactWithoutIcons; hasChanges = true; }
    if (isMissing(existingData.socials)) { newData.socials = socialsWithoutIcons; hasChanges = true; }
    if (isMissing(existingData.chapters)) { newData.chapters = defaultChapters; hasChanges = true; }
    if (isMissing(existingData.techstack)) { newData.techstack = defaultTechStack; hasChanges = true; }

    if (hasChanges || !snapshot.exists()) {
      console.log('Synchronizing default data to Realtime Database...');
      await set(dataRef, {
        ...newData,
        last_update: Date.now()
      });
      console.log('Realtime Database synchronized successfully.');
    }
  } catch (error) {
    console.error('Error initializing Realtime Database:', error);
  }
};

// Generic getter and setter for Realtime Database
const getData = async (key: string, defaultValue: any) => {
  try {
    const dataRef = ref(db, `${DATA_PATH}/${key}`);
    const snapshot = await get(dataRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error) {
    console.error(`Error getting ${key} from Realtime Database:`, error);
  }
  return defaultValue;
};

const saveData = async (key: string, data: any) => {
  try {
    const dataRef = ref(db, DATA_PATH);
    await update(dataRef, {
      [key]: data,
      last_update: Date.now()
    });
  } catch (error) {
    console.error(`Error saving ${key} to Realtime Database:`, error);
  }
};

// Get data with automatic sorting and status updates
export const getExperiences = async () => {
  const experiences = await getData('experiences', []);
  if (!experiences || experiences.length === 0) return defaultExperiences;

  const currentYear = new Date().getFullYear();
  return experiences.map((exp: any) => {
    const endYear = exp.period?.includes('Present') ? currentYear : parseInt(exp.period?.split('-')[1]?.trim() || currentYear);
    const status = exp.period?.includes('Present') ? 'current' : 'completed';
    const defaultExp = defaultExperiences.find(e => e.id === exp.id);
    return { ...exp, type: status, endYear, icon: defaultExp?.icon || defaultExperiences[0].icon };
  }).sort((a: any, b: any) => b.endYear - a.endYear);
};

export const saveExperiences = async (data: any[]) => {
  const experiencesWithoutIcons = data.map(({ icon, ...rest }) => rest);
  await saveData('experiences', experiencesWithoutIcons);
};

export const getProjects = async () => {
  const projects = await getData('projects', []);
  if (!projects || projects.length === 0) return defaultProjects;

  return projects.map((project: any) => {
    const defaultProject = defaultProjects.find(p => p.id === project.id);
    return { ...project, icon: defaultProject?.icon || defaultProjects[0].icon };
  });
};

export const saveProjects = async (data: any[]) => {
  const projectsWithoutIcons = data.map(({ icon, ...rest }) => rest);
  await saveData('projects', projectsWithoutIcons);
};

export const getSkills = async () => {
  const skills = await getData('skills', null);
  return skills || defaultSkills;
};

export const saveSkills = async (data: any[]) => {
  await saveData('skills', data);
};

export const getAbout = async () => {
  const about = await getData('about', null);
  if (!about) return defaultAbout;

  if (about.highlights && Array.isArray(about.highlights)) {
    about.highlights = about.highlights.map((highlight: any, index: number) => {
      const defaultHighlight = defaultAbout.highlights[index];
      return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
    });
  }
  return about;
};

export const saveAbout = async (data: any) => {
  const aboutWithoutIcons = { ...data };
  if (aboutWithoutIcons.highlights) {
    aboutWithoutIcons.highlights = aboutWithoutIcons.highlights.map(({ icon, ...rest }: any) => rest);
  }
  await saveData('about', aboutWithoutIcons);
};

export const getPersonalInfo = async () => {
  const personal = await getData('personal', null);
  return personal || defaultPersonalInfo;
};

export const savePersonalInfo = async (data: any) => {
  await saveData('personal', data);
};

export const getCertifications = async () => {
  const certs = await getData('certifications', []);
  if (!certs || certs.length === 0) return defaultCertifications;
  return certs.sort((a: any, b: any) => b.year - a.year);
};

export const saveCertifications = async (data: any) => {
  await saveData('certifications', data);
};

export const getAchievements = async () => {
  const achievements = await getData('achievements', []);
  if (!achievements || achievements.length === 0) return defaultAchievements;
  return achievements.sort((a: any, b: any) => b.year - a.year);
};

export const saveAchievements = async (data: any) => {
  await saveData('achievements', data);
};

export const getContactInfo = async () => {
  const contact = await getData('contact', []);
  if (!contact || contact.length === 0) return defaultContactInfo;
  return contact;
};

export const saveContactInfo = async (data: any) => {
  const withoutIcons = data.map(({ icon, ...rest }: any) => rest);
  await saveData('contact', withoutIcons);
};

export const getSocials = async () => {
  const socials = await getData('socials', []);
  if (!socials || socials.length === 0) return defaultSocials;
  return socials;
};

export const saveSocials = async (data: any) => {
  const withoutIcons = data.map(({ icon, ...rest }: any) => rest);
  await saveData('socials', withoutIcons);
};

export const getChapters = async () => {
  const chapters = await getData('chapters', []);
  return chapters && chapters.length > 0 ? chapters : defaultChapters;
};

export const saveChapters = async (data: any) => {
  await saveData('chapters', data);
};

export const getTechStack = async () => {
  const techstack = await getData('techstack', []);
  return techstack && techstack.length > 0 ? techstack : defaultTechStack;
};

export const saveTechStack = async (data: any) => {
  await saveData('techstack', data);
};

export const getAboutContent = async () => {
  return await getAbout();
};

export const saveAboutContent = async (data: any) => {
  await saveAbout(data);
};

export const deleteAllData = async () => {
  if (typeof window === 'undefined') return;
  const dataRef = ref(db, DATA_PATH);
  await set(dataRef, null);
  await initializeData();
};
