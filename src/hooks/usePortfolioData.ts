import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
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

// Maps icons from local defaults to database data (icons can't be stored in database)
const mapIcons = (rawData: any) => {
    if (!rawData) return null;

    return {
        ...rawData,
        experiences: (rawData.experiences || []).map((exp: any) => {
            const defaultExp = defaultExperiences.find(e => e.id === exp.id || e.company === exp.company);
            return { ...exp, icon: defaultExp?.icon || defaultExperiences[0]?.icon };
        }),
        projects: (rawData.projects || []).map((project: any) => {
            const defaultProject = defaultProjects.find(p => p.id === project.id || p.title === project.title);
            return { ...project, icon: defaultProject?.icon || defaultProjects[0]?.icon };
        }),
        about: rawData.about ? {
            ...rawData.about,
            highlights: (rawData.about.highlights || []).map((highlight: any, index: number) => {
                const defaultHighlight = defaultAbout.highlights[index];
                return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0]?.icon };
            })
        } : defaultAbout,
        skills: (rawData.skills || defaultSkills).map((cat: any) => {
            const defaultCat = defaultSkills.find(c => c.title === cat.title);
            return {
                ...cat,
                skills: (cat.skills || []).map((skill: any) => {
                    const defaultSkill = defaultCat?.skills.find(s => s.name === skill.name);
                    return { ...skill, icon: defaultSkill?.icon || defaultCat?.skills[0]?.icon || "🚀" };
                })
            };
        }),
        personal: rawData.personal || defaultPersonalInfo,
        contact: rawData.contact || [],
        socials: rawData.socials || [],
        certifications: rawData.certifications || defaultCertifications,
        achievements: rawData.achievements || defaultAchievements,
        chapters: rawData.chapters || defaultChapters,
        techstack: rawData.techstack || defaultTechStack,
    };
};

export const usePortfolioData = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataRef = ref(db, 'portfolio');

        // Real-time listener to Realtime Database
        const unsubscribe = onValue(dataRef, (snapshot) => {
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                setData(mapIcons(rawData));
            } else {
                // No data in database - use defaults
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
            // On error, fall back to defaults
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
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { data, loading };
};
