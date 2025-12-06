const skills = [
  { name: "React", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Node.js", level: 85 },
  { name: "UI/UX Design", level: 88 },
  { name: "Tailwind CSS", level: 95 },
  { name: "PostgreSQL", level: 80 },
];

const About = () => {
  return (
    <section id="about" className="section-padding relative">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-widest mb-4 block">
              About Me
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Turning ideas into{" "}
              <span className="text-gradient">digital reality</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I'm a passionate full-stack developer with over 5 years of experience 
                building web applications. My journey started with curiosity about how 
                websites work, and it has evolved into a deep love for creating 
                exceptional digital experiences.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new technologies, 
                contributing to open-source projects, or sharing knowledge with 
                the developer community. I believe in writing clean, maintainable 
                code that stands the test of time.
              </p>
              <p>
                I specialize in React, TypeScript, and modern web technologies, 
                with a keen eye for design and user experience. Every project is 
                an opportunity to learn something new and push the boundaries of 
                what's possible.
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="glass-card p-8">
            <h3 className="font-display text-xl font-semibold mb-8">
              Skills & Expertise
            </h3>
            <div className="space-y-6">
              {skills.map((skill, index) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground font-medium">{skill.name}</span>
                    <span className="text-primary text-sm">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${skill.level}%`,
                        background: "var(--gradient-primary)",
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
