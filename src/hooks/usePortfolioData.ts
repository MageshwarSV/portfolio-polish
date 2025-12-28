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
// Also filters out inactive items (isActive: false) from the live site
const mapIcons = (rawData: any) => {
    if (!rawData) return null;

    // Helper to filter active items only (isActive !== false means active by default)
    const filterActive = (items: any[]) =>
        (items || []).filter((item: any) => item.isActive !== false);

    return {
        ...rawData,
        // Filter and map experiences
        experiences: filterActive(rawData.experiences || []).map((exp: any) => {
            const defaultExp = defaultExperiences.find(e => e.id === exp.id || e.company === exp.company);
            return { ...exp, icon: defaultExp?.icon || defaultExperiences[0]?.icon };
        }),
        // Filter and map projects
        projects: filterActive(rawData.projects || []).map((project: any) => {
            const defaultProject = defaultProjects.find(p => p.id === project.id || p.title === project.title);
            return { ...project, icon: defaultProject?.icon || defaultProjects[0]?.icon };
        }),
        about: rawData.about ? {
            ...rawData.about,
            // Filter and map highlights
            highlights: filterActive(rawData.about.highlights || []).map((highlight: any, index: number) => {
                const defaultHighlight = defaultAbout.highlights[index];
                return { ...highlight, icon: defaultHighlight?.icon || defaultAbout.highlights[0]?.icon };
            })
        } : defaultAbout,
        // Filter and map skills (per category)
        skills: filterActive(rawData.skills || defaultSkills).map((cat: any) => {
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
        // Filter contact info
        contact: filterActive(rawData.contact || []),
        // Filter socials
        socials: filterActive(rawData.socials || []),
        // Filter certifications
        certifications: filterActive(rawData.certifications || defaultCertifications),
        // Filter achievements
        achievements: filterActive(rawData.achievements || defaultAchievements),
        // Filter chapters
        chapters: filterActive(rawData.chapters || defaultChapters),
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
