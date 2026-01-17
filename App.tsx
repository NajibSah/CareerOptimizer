
import React, { useState, useRef, useEffect } from 'react';
import { AppMode, GeneratorResponse, CheckerResponse } from './types';
import { generateCV, checkCV } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.GENERATOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Mode 1 state
  const [careerDetails, setCareerDetails] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [generatorResult, setGeneratorResult] = useState<GeneratorResponse | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Mode 2 state
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [checkerResult, setCheckerResult] = useState<CheckerResponse | null>(null);
  const [cvInputMethod, setCvInputMethod] = useState<'text' | 'pdf'>('pdf');
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleGeneratorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateCV(careerDetails, targetJob);
      setGeneratorResult(data);
    } catch (err) {
      setError('Failed to generate career strategy. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setSelectedFile({
          data: base64Data,
          mimeType: file.type,
          name: file.name
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cvInput = cvInputMethod === 'pdf' && selectedFile 
        ? { file: { data: selectedFile.data, mimeType: selectedFile.mimeType } }
        : { text: cvText };

      if (cvInputMethod === 'text' && !cvText.trim()) {
        setError('Please paste your CV text.');
        setLoading(false);
        return;
      }

      if (cvInputMethod === 'pdf' && !selectedFile) {
        setError('Please upload a PDF CV.');
        setLoading(false);
        return;
      }

      const data = await checkCV(cvInput, jobDescription);
      setCheckerResult(data);
    } catch (err) {
      setError('Failed to check CV gaps. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const inputClasses = "w-full px-4 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500";
  const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1";

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Dynamic Header */}
      <header className="glass dark:glass border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-18 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 hidden sm:block">
              CareerOptimizer
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setMode(AppMode.GENERATOR)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === AppMode.GENERATOR ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              CV Generator
            </button>
            <button 
              onClick={() => setMode(AppMode.CHECKER)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${mode === AppMode.CHECKER ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Gap Checker
            </button>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
        {mode === AppMode.GENERATOR ? (
          <div className="space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Strategy Engine</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">Synthesize your career history into high-conversion executive sections.</p>
            </div>

            <form onSubmit={handleGeneratorSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
              <div>
                <label className={labelClasses}>Career Background & Details</label>
                <textarea 
                  className={`${inputClasses} h-40 resize-none`}
                  placeholder="Tell us your journey, major wins, and current toolkit..."
                  value={careerDetails}
                  onChange={(e) => setCareerDetails(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}>Target Job Title</label>
                <input 
                  type="text"
                  className={inputClasses}
                  placeholder="e.g., Executive Design Lead, VP of Engineering..."
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-4 text-lg">
                Optimize My Profile
              </Button>
            </form>

            {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800/50 font-medium">{error}</div>}

            {generatorResult && (
              <div className="space-y-12 py-8">
                {/* Recommended Skills */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
                    <span className="w-1.5 h-8 bg-indigo-500 rounded-full"></span>
                    Targeted Skill Recommendations
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {generatorResult.suggestedSkills.map((skill, i) => (
                      <button
                        key={i}
                        onClick={() => toggleSkill(skill.name)}
                        className={`px-5 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all duration-300 ${
                          selectedSkills.includes(skill.name)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500'
                        }`}
                      >
                        {skill.name} {selectedSkills.includes(skill.name) ? '✓' : '+'}
                      </button>
                    ))}
                  </div>
                </section>

                {/* CV Layout Mockup */}
                <section className="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-left relative overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  
                  <div className="space-y-10">
                    <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                       <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Name Here</h2>
                       <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-1 tracking-widest text-sm">{targetJob.toUpperCase()}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="md:col-span-2 space-y-8">
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-[0.2em] mb-4">Professional Profile</h4>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm antialiased">{generatorResult.cvSections.professionalSummary}</p>
                        </div>

                        <div>
                          <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-[0.2em] mb-4">Career Highlights</h4>
                          <div className="space-y-6">
                            {generatorResult.cvSections.experience.map((exp, i) => (
                              <div key={i}>
                                <h5 className="font-bold text-slate-900 dark:text-white text-base">{exp.role}</h5>
                                <ul className="mt-2 space-y-2">
                                  {exp.bulletPoints.map((bp, j) => (
                                    <li key={j} className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-3">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                                      {bp}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl">
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-[0.2em] mb-4">Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {generatorResult.cvSections.coreCompetencies.map((comp, i) => (
                              <span key={i} className="text-[11px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400">
                                {comp}
                              </span>
                            ))}
                            {selectedSkills.map((skill, i) => (
                              <span key={`added-${i}`} className="text-[11px] font-bold bg-indigo-600 text-white px-3 py-1 rounded-lg shadow-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-[0.2em] mb-4">Focus Projects</h4>
                          <div className="space-y-4">
                            {generatorResult.cvSections.keyProjects.map((proj, i) => (
                              <div key={i} className="space-y-1">
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs">{proj.title}</h5>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed uppercase tracking-wide">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Canva Logic Section */}
                <section className="bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-500/20 p-10 rounded-[2.5rem] text-center space-y-8">
                  <div className="max-w-2xl mx-auto space-y-4">
                    <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-300">Final Step: Visual Identity</h3>
                    <p className="text-indigo-800/70 dark:text-indigo-400/70 font-medium leading-relaxed">
                      {generatorResult.canvaLogic}
                    </p>
                  </div>
                  <Button variant="canva" className="mx-auto h-14 px-10" onClick={() => window.open('https://www.canva.com/resumes/templates/', '_blank')}>
                    CHOOSE YOUR TEMPLATE IN CANVA
                  </Button>
                </section>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Revenue Gap Analysis</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">Benchmark your current profile against any role to unlock new certification paths.</p>
            </div>

            <form onSubmit={handleCheckerSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Primary CV Source</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button 
                        type="button"
                        onClick={() => setCvInputMethod('pdf')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${cvInputMethod === 'pdf' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        PDF FILE
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCvInputMethod('text')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${cvInputMethod === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        RAW TEXT
                      </button>
                    </div>
                  </div>

                  {cvInputMethod === 'pdf' ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-72 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${selectedFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-950'}`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".pdf" 
                        className="hidden" 
                      />
                      {selectedFile ? (
                        <div className="text-center p-6 animate-in zoom-in-95 duration-300">
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          </div>
                          <p className="font-black text-slate-800 dark:text-slate-200 text-sm truncate max-w-[240px]">{selectedFile.name}</p>
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-2 uppercase tracking-tighter">Verified PDF Asset</p>
                        </div>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:text-indigo-500">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                          </div>
                          <p className="font-black text-slate-600 dark:text-slate-400 text-sm tracking-tight">Drop your PDF here</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Or click to browse your local storage</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea 
                      className={`${inputClasses} h-72 text-sm leading-relaxed`}
                      placeholder="Paste your existing resume content here for deep analysis..."
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Benchmark Job Description</label>
                  <textarea 
                    className={`${inputClasses} h-72 text-sm leading-relaxed`}
                    placeholder="Paste the target job description to identify optimization gaps..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-5 text-xl font-black rounded-2xl shadow-2xl shadow-indigo-500/20">
                Execute Benchmark Analysis
              </Button>
            </form>

            {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800/50 font-medium">{error}</div>}

            {checkerResult && (
              <div className="space-y-8 animate-in fade-in duration-700 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <span className="flex items-center justify-center w-12 h-12 bg-amber-500 text-white rounded-2xl text-2xl shadow-lg shadow-amber-500/20">!</span>
                    Strategic Skill Gaps
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Calculated based on {checkerResult.skillGaps.length} critical missing nodes.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {checkerResult.skillGaps.map((gap, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                      
                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-black text-slate-900 dark:text-white">{gap.skill}</h4>
                          <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full uppercase tracking-[0.15em]">
                            {gap.platform.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed italic">"{gap.reason}"</p>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 relative">
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-black uppercase tracking-widest">Recommended Accreditation</div>
                        <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mb-4 leading-tight">{gap.suggestedCourse}</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            {gap.platform}
                          </span>
                          <button className="text-indigo-600 dark:text-indigo-400 text-sm font-black hover:translate-x-1 transition-transform flex items-center gap-1 group/btn">
                            Enrol <span className="text-lg">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center gap-8 opacity-40 dark:opacity-20 grayscale">
             {/* Mock Partner Logos */}
             <div className="h-6 w-24 bg-slate-400 rounded"></div>
             <div className="h-6 w-24 bg-slate-400 rounded"></div>
             <div className="h-6 w-24 bg-slate-400 rounded"></div>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">
            Strategic Intelligence Engine v2.5.0
          </p>
          <div className="text-[10px] text-slate-400/50 uppercase font-medium">
            &copy; 2025 CareerOptimizer Global. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
