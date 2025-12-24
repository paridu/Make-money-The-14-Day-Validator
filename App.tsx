import React, { useState, useEffect } from 'react';
import { ProjectState, INITIAL_STATE, Phase } from './types';
import { analyzeD3, generateFakeDemoScript, analyzeDemand, generateMVPPlan, generateViralIdeas, processRawComments } from './services/gemini';
import StepIndicator from './components/StepIndicator';
import { MarkdownViewer } from './components/MarkdownViewer';
import { ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Rocket, Video, BarChart2, ShieldAlert, Sparkles, FileText, Download } from 'lucide-react';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<Phase>('idea');
  const [project, setProject] = useState<ProjectState>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [rawComments, setRawComments] = useState('');
  const [showRawInput, setShowRawInput] = useState(false);

  // --- LocalStorage ---
  useEffect(() => {
    const saved = localStorage.getItem('vibeLaunchpadState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProject(parsed);
        // Infer phase
        if (parsed.mvpSpecs) setCurrentPhase('mvp');
        else if (parsed.isGo) setCurrentPhase('demand');
        else if (parsed.videoScript) setCurrentPhase('content');
        else if (parsed.d3Analysis) setCurrentPhase('idea');
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vibeLaunchpadState', JSON.stringify(project));
  }, [project]);

  // --- Handlers ---

  const handleAutoGenerateIdeas = async () => {
    setLoading(true);
    try {
        const ideas = await generateViralIdeas(project.niche);
        setProject(prev => ({ ...prev, idea: ideas }));
    } finally {
        setLoading(false);
    }
  };

  const handleIdeaSubmit = async () => {
    if (!project.idea || !project.niche) return;
    setLoading(true);
    try {
        const analysis = await analyzeD3(project.idea, project.niche);
        setProject(prev => ({ ...prev, d3Analysis: analysis }));
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
        const script = await generateFakeDemoScript(project.idea);
        setProject(prev => ({ ...prev, videoScript: script }));
    } finally {
        setLoading(false);
    }
  };

  const handleRawCommentAnalysis = async () => {
    if (!rawComments) return;
    setLoading(true);
    try {
        const result = await processRawComments(rawComments);
        setProject(prev => ({
            ...prev,
            demandData: {
                comments: result.comments,
                wants: result.wants,
                feedback: result.feedback
            }
        }));
        setShowRawInput(false);
    } finally {
        setLoading(false);
    }
  };

  const handleAnalyzeDemand = async () => {
    setLoading(true);
    try {
        const result = await analyzeDemand(
            project.demandData.comments, 
            project.demandData.wants, 
            project.demandData.feedback
        );
        setProject(prev => ({ ...prev, demandAnalysis: result.analysis, isGo: result.isGo }));
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateMVP = async () => {
    if (!project.demandAnalysis) return;
    setLoading(true);
    try {
        const specs = await generateMVPPlan(project.idea, project.demandAnalysis);
        setProject(prev => ({ ...prev, mvpSpecs: specs }));
    } finally {
        setLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderSectionHeader = (title: string, icon: React.ReactNode, desc: string) => (
    <div className="mb-6 border-b border-slate-700 pb-4">
      <div className="flex items-center gap-3 text-indigo-400 mb-1">
        {icon}
        <h2 className="text-xl font-bold uppercase tracking-wide">{title}</h2>
      </div>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );

  const renderAIOutput = (content: string | null) => {
    if (loading) return (
      <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col items-center justify-center animate-pulse h-64">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">กำลังปรึกษา Vibe Agents...</p>
      </div>
    );
    
    if (!content) return null;

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl shadow-black/20 mt-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
        <div className="mb-4 flex justify-between items-center">
             <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-900/30 px-2 py-1 rounded">ผลลัพธ์จาก AI Agent</span>
             <button onClick={() => navigator.clipboard.writeText(content)} className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
                <FileText className="w-3 h-3" /> คัดลอก
             </button>
        </div>
        <MarkdownViewer content={content} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-3">
          Vibe Launchpad
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Content First, Product Later: ตรวจสอบไอเดียสตาร์ทอัพใน 14 วัน
        </p>
      </header>

      <StepIndicator currentPhase={currentPhase} />

      <main className="max-w-4xl mx-auto bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-6 md:p-8 min-h-[600px] flex flex-col shadow-2xl">
        
        {/* PHASE 1: IDEA */}
        {currentPhase === 'idea' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderSectionHeader('ขั้นตอนที่ 1: ไอเดีย & เช็คสูตร D³', <ShieldAlert className="w-6 h-6" />, 'วันที่ 1-3: อย่าเพิ่งสร้าง เช็คพฤติกรรมลูกค้าก่อน')}
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">กลุ่มเป้าหมาย / Niche</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="เช่น พนักงานออฟฟิศที่เบื่องาน, นักศึกษา Gen Z..."
                    value={project.niche}
                    onChange={(e) => setProject({...project, niche: e.target.value})}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-slate-300">ไอเดียสตาร์ทอัพ</label>
                    <button 
                        onClick={handleAutoGenerateIdeas}
                        className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition"
                        disabled={loading}
                    >
                        <Sparkles className="w-3 h-3" /> ให้ AI ช่วยคิด
                    </button>
                  </div>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    placeholder="อธิบายไอเดียของคุณ หรือกดปุ่มให้ AI ช่วยคิด..."
                    value={project.idea}
                    onChange={(e) => setProject({...project, idea: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleIdeaSubmit}
                  disabled={!project.idea || !project.niche || loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ด้วยสูตร D³'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-700">
                <h3 className="text-slate-400 font-semibold mb-3 text-sm uppercase">สูตร D³</h3>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">D1</span> 
                    <span>Demonstrable: ทำเป็นวิดีโอแล้วเข้าใจทันทีไหม?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">D2</span> 
                    <span>Desirable: แตะสัญชาตญาณดิบของมนุษย์ไหม?</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold">D3</span> 
                    <span>Debatable: คนดูจะเถียงหรือคอมเมนต์ไหม?</span>
                  </li>
                </ul>
              </div>
            </div>

            {project.d3Analysis && !loading && (
                <div className="animate-in fade-in duration-500">
                     {renderAIOutput(project.d3Analysis)}
                     <div className="mt-6 flex justify-end">
                        <button 
                            onClick={() => setCurrentPhase('content')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-900/50"
                        >
                            ผ่านเกณฑ์ ไปขั้นตอนต่อไป <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                </div>
            )}
          </div>
        )}

        {/* PHASE 2: CONTENT */}
        {currentPhase === 'content' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderSectionHeader('ขั้นตอนที่ 2: วิดีโอเดโมปลอม (Fake Demo)', <Video className="w-6 h-6" />, 'วันที่ 4-5: สร้างวิดีโอเพื่อเช็คความต้องการจริง')}
            
            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 mb-6">
                <p className="text-slate-300 mb-4">
                    เราต้องสร้างสคริปต์สำหรับ "Fake Demo" คุณยังไม่ต้องเขียนโค้ดแอพจริง แต่ใช้ CapCut/Figma ตัดต่อให้ดูเหมือนมีแอพแล้ว
                </p>
                <button 
                  onClick={handleGenerateScript}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4" /> สร้างสคริปต์วิดีโอไวรัล
                </button>
            </div>

            {renderAIOutput(project.videoScript)}

            {project.videoScript && !loading && (
                 <div className="mt-8 flex justify-between items-center border-t border-slate-700 pt-6">
                    <p className="text-slate-400 text-sm">เมื่อโพสต์ลง TikTok/Reels แล้ว ให้รอผล 48 ชั่วโมง</p>
                    <button 
                        onClick={() => setCurrentPhase('demand')}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition"
                    >
                        โพสต์แล้ว ไปต่อ <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
            )}
          </div>
        )}

        {/* PHASE 3: DEMAND */}
        {currentPhase === 'demand' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {renderSectionHeader('ขั้นตอนที่ 3: ประตูด่านอรหันต์ (Demand Gate)', <BarChart2 className="w-6 h-6" />, 'วันที่ 6-7: วิเคราะห์สัญญาณ ว่าคนอยากได้จริงไหม?')}

             <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-300">กรอกข้อมูลผลลัพธ์วิดีโอ</h3>
                        <button 
                            onClick={() => setShowRawInput(!showRawInput)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                        >
                            {showRawInput ? 'กรอกเอง' : 'ให้ AI อ่านคอมเมนต์'}
                        </button>
                    </div>

                    {showRawInput ? (
                         <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 animate-in fade-in">
                            <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">วางข้อความคอมเมนต์ทั้งหมดที่นี่</label>
                            <textarea 
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-xs h-40 mb-2"
                                placeholder="ก๊อปปี้คอมเมนต์มาวาง..."
                                value={rawComments}
                                onChange={(e) => setRawComments(e.target.value)}
                            />
                            <button 
                                onClick={handleRawCommentAnalysis}
                                disabled={loading || !rawComments}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 rounded transition"
                            >
                                {loading ? 'กำลังประมวลผล...' : 'เติมข้อมูลอัตโนมัติ'}
                            </button>
                         </div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">จำนวนคอมเมนต์ทั้งหมด</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white mt-1"
                                    value={project.demandData.comments}
                                    onChange={(e) => setProject({...project, demandData: { ...project.demandData, comments: parseInt(e.target.value) || 0 }})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">คอมเมนต์ที่บอกว่า 'อยากได้'</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white mt-1"
                                    value={project.demandData.wants}
                                    onChange={(e) => setProject({...project, demandData: { ...project.demandData, wants: parseInt(e.target.value) || 0 }})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">ตัวอย่างฟีดแบคเชิงคุณภาพ</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white mt-1 h-24 text-sm"
                                    placeholder="วางตัวอย่างคอมเมนต์ที่นี่..."
                                    value={project.demandData.feedback}
                                    onChange={(e) => setProject({...project, demandData: { ...project.demandData, feedback: e.target.value }})}
                                />
                            </div>
                        </>
                    )}

                    <button 
                        onClick={handleAnalyzeDemand}
                        disabled={loading || project.demandData.comments === 0}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        วิเคราะห์สัญญาณความต้องการ
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 flex flex-col justify-center">
                         <div className="text-center">
                            <h4 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">เกณฑ์การผ่านด่าน</h4>
                            <div className="flex justify-around mb-6">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-white">100+</span>
                                    <span className="text-xs text-slate-500">คอมเมนต์</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-emerald-400">10%</span>
                                    <span className="text-xs text-slate-500">อัตราคนอยากได้</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 italic">"ถ้าคนไม่เถียง แปลว่าเขายังไม่อยากได้"</p>
                         </div>
                    </div>

                    {/* Example Comments Helper Section */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm">
                        <h5 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> ตัวช่วยแยกประเภท
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-emerald-400 font-bold text-xs uppercase block mb-1">ความต้องการสูง (นับพวกนี้)</span>
                                <ul className="text-slate-400 text-xs list-disc pl-3 space-y-1">
                                    <li>"โหลดได้ที่ไหนครับ?"</li>
                                    <li>"พร้อมจ่าย!"</li>
                                    <li>"อยากได้มานานแล้ว"</li>
                                    <li>"มีของ iOS ไหม?"</li>
                                </ul>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold text-xs uppercase block mb-1">ความต้องการต่ำ (ไม่ต้องนับ)</span>
                                <ul className="text-slate-500 text-xs list-disc pl-3 space-y-1">
                                    <li>"คลิปสวยดีครับ"</li>
                                    <li>"ตลกจัง 555"</li>
                                    <li>"ตัดต่อเก่งมาก"</li>
                                    <li>(แท็กเพื่อนเฉยๆ)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {renderAIOutput(project.demandAnalysis)}

             {project.demandAnalysis && !loading && (
                 <div className="mt-6 flex justify-end gap-4">
                     <button 
                        onClick={() => {
                             setProject({...project, isGo: false, demandAnalysis: null});
                             setCurrentPhase('idea');
                        }}
                        className="px-4 py-2 text-red-400 hover:text-red-300 text-sm font-medium transition"
                     >
                        ล้มเลิกไอเดีย & เริ่มใหม่
                     </button>
                     {project.isGo ? (
                         <button 
                            onClick={() => setCurrentPhase('mvp')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-emerald-900/50 flex items-center gap-2"
                        >
                            ผ่านฉลุย! ลุยสัปดาห์ที่ 2 <CheckCircle2 className="w-5 h-5" />
                         </button>
                     ) : (
                         <div className="flex items-center text-amber-500 gap-2 bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-800">
                             <AlertTriangle className="w-5 h-5" />
                             <span className="font-bold">สัญญาณความต้องการอ่อนเกินไป อย่าเพิ่งเขียนโค้ด</span>
                         </div>
                     )}
                 </div>
             )}
          </div>
        )}

        {/* PHASE 4: MVP */}
        {currentPhase === 'mvp' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {renderSectionHeader('ขั้นตอนที่ 4: สเปค MVP & โปรโตไทป์', <FileText className="w-6 h-6" />, 'สัปดาห์ที่ 2: น่าอายแต่ขายได้ (Shameful but Sellable)')}
             
             <div className="bg-emerald-900/20 border border-emerald-800 p-6 rounded-xl mb-6">
                 <h3 className="text-emerald-400 font-bold text-lg mb-2">การตรวจสอบสำเร็จ! 🚀</h3>
                 <p className="text-emerald-100/70 text-sm">
                     คุณพิสูจน์แล้วว่ามีคนอยากได้ ตอนนี้ให้ AI ช่วยวางแผนและเขียนโค้ดให้
                 </p>
             </div>

             {!project.mvpSpecs && (
                 <button 
                    onClick={handleGenerateMVP}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-500/30 transition transform hover:-translate-y-1"
                 >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    สร้างแผนงาน MVP & เขียนโค้ด
                 </button>
             )}

             {renderAIOutput(project.mvpSpecs)}
             
             {project.mvpSpecs && (
                 <div className="mt-8 text-center border-t border-slate-700 pt-8">
                     <p className="text-slate-500 italic mb-4">"MVP ที่น่าอาย แต่มีคนจ่าย = Product ที่ถูกต้อง"</p>
                     <button className="text-slate-400 hover:text-white text-sm underline flex items-center justify-center gap-2 mx-auto" onClick={() => window.print()}>
                        <Download className="w-4 h-4" /> บันทึกพิมพ์เขียว
                     </button>
                 </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
}