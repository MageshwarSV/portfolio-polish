import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
    experiences as defaultExperiences,
    projects as defaultProjects,
    skillCategories as defaultSkills,
    aboutContent as defaultAbout,
    personalInfo as defaultPersonalInfo,
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
                const mappedData = {
                    ...rawData,
                    experiences: (rawData.experiences || defaultExperiences).map((exp: any) => {
                        const defaultExp = defaultExperiences.find(e => e.id === exp.id);
                        return { ...exp, icon: defaultExp?.icon || defaultExperiences[0].icon };
                    }),
                    projects: (rawData.projects || defaultProjects).map((project: any) => {
                        const defaultProject = defaultProjects.find(p => p.id === project.id);
                        return { ...project, icon: defaultProject?.icon || defaultProjects[0].icon };
                    }),
                    about: rawData.about ? {
                        ...rawData.about,
                        highlights: (rawData.about.highlights || defaultAbout.highlights).map((highlight: any, index: number) => {
                            const defaultHighlight = defaultAbout.highlights[index];
                            return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0].icon };
                        })
                    } : defaultAbout,
                    skills: rawData.skills || defaultSkills,
                    personal: rawData.personal || defaultPersonalInfo,
                    certifications: rawData.certifications || [],
                    achievements: rawData.achievements || [],
                    contact: (rawData.contact || []).map((contact: any) => {
                        const defaultContact = (defaultAbout as any).contactInfo?.find((c: any) => c.label === contact.label);
                        return { ...contact, icon: defaultContact?.icon };
                    }),
                    socials: (rawData.socials || []).map((social: any) => {
                        const defaultSocial = (defaultAbout as any).socials?.find((s: any) => s.label === social.label);
                        return { ...social, icon: defaultSocial?.icon };
                    }),
                    chapters: rawData.chapters || [],
                    techstack: rawData.techstack || [],
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
