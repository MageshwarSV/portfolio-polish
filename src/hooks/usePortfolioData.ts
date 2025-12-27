import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
    experiences as defaultExperiences,
    projects as defaultProjects,
    skillCategories as defaultSkills,
    aboutContent as defaultAbout,
    personalInfo as defaultPersonalInfo,
    chapters as defaultChapters,
    techStack as defaultTechStack,
    certifications as defaultCertifications,
    achievements as defaultAchievements,
} from '@/data/storytellingData';

export const usePortfolioData = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'portfolio', 'global_data');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const rawData = docSnap.data();

                // Map icons back to data where needed
                const experiences = rawData.experiences && rawData.experiences.length > 0
                    ? rawData.experiences
                    : defaultExperiences;

                const projects = rawData.projects && rawData.projects.length > 0
                    ? rawData.projects
                    : defaultProjects;

                const skills = rawData.skills && rawData.skills.length > 0
                    ? rawData.skills
                    : defaultSkills;

                const mappedData = {
                    ...rawData,
                    experiences: experiences.map((exp: any) => {
                        const defaultExp = defaultExperiences.find(e => e.id === exp.id || e.company === exp.company);
                        return { ...exp, icon: defaultExp?.icon || defaultExperiences[0].icon };
                    }),
                    projects: projects.map((project: any) => {
                        const defaultProject = defaultProjects.find(p => p.id === project.id || p.title === project.title);
                        return { ...project, icon: defaultProject?.icon || defaultProjects[0].icon };
                    }),
                    about: rawData.about ? {
                        ...rawData.about,
                        highlights: (rawData.about.highlights || defaultAbout.highlights).map((highlight: any, index: number) => {
                            const defaultHighlight = defaultAbout.highlights[index];
                            return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
                        })
                    } : defaultAbout,
                    skills: skills.map((cat: any) => {
                        const defaultCat = defaultSkills.find(c => c.title === cat.title);
                        return {
                            ...cat,
                            skills: (cat.skills || []).map((skill: any, idx: number) => {
                                const defaultSkill = defaultCat?.skills.find(s => s.name === skill.name);
                                return { ...skill, icon: defaultSkill?.icon || defaultCat?.skills[0]?.icon || "🚀" };
                            })
                        };
                    }),
                    personal: rawData.personal || defaultPersonalInfo,
                    contact: (rawData.contact || []).map((contact: any) => {
                        const defaultContact = (defaultAbout as any).contactInfo?.find((c: any) => c.label === contact.label);
                        return { ...contact, icon: defaultContact?.icon };
                    }),
                    socials: (rawData.socials || []).map((social: any) => {
                        const defaultSocial = (defaultAbout as any).socials?.find((s: any) => s.label === social.label);
                        return { ...social, icon: defaultSocial?.icon };
                    }),
                    certifications: (rawData.certifications && rawData.certifications.length > 0) ? rawData.certifications : defaultCertifications,
                    achievements: (rawData.achievements && rawData.achievements.length > 0) ? rawData.achievements : defaultAchievements,
                    chapters: rawData.chapters && rawData.chapters.length > 0 ? rawData.chapters : defaultChapters,
                    techstack: rawData.techstack && rawData.techstack.length > 0 ? rawData.techstack : defaultTechStack,
                };

                setData(mappedData);
            } else {
                // Fallback to defaults if doc doesn't exist yet
                setData({
                    experiences: defaultExperiences,
                    projects: defaultProjects,
                    skills: defaultSkills,
                    about: defaultAbout,
                    personal: defaultPersonalInfo,
                    certifications: defaultCertifications,
                    achievements: defaultAchievements,
                    contact: [],
                    socials: [],
                    chapters: defaultChapters,
                    techstack: defaultTechStack,
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to portfolio data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { data, loading };
};
