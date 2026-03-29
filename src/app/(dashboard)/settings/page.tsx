"use client";
import React, { useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Notification01Icon, Shield01Icon, Key01Icon, Moon01Icon, ComputerIcon, Sun01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { MagicCard } from '@/components/ui/magic-card';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');
  const tabs = [
    { name: 'Profile', icon: <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="w-4 h-4" /> },
    { name: 'Notifications', icon: <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.5} className="w-4 h-4" /> },
    { name: 'Security', icon: <HugeiconsIcon icon={Shield01Icon} strokeWidth={1.5} className="w-4 h-4" /> },
    { name: 'Appearance', icon: <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.5} className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Workspace Header */}
      <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-geist flex items-center gap-2">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-5 h-5 text-white/70" />
            Settings
          </h1>
          <p className="text-zinc-400 text-sm">Manage your account preferences and application settings.</p>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="md:w-64 shrink-0">
            <div className="space-y-1 bg-zinc-900/40 border border-white/5 p-2 rounded-2xl">
               {tabs.map((tab) => {
                 const isActive = activeTab === tab.name;
                 return (
                   <button
                     key={tab.name}
                     onClick={() => setActiveTab(tab.name)}
                     className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                       isActive 
                         ? 'bg-white/10 text-white shadow-sm' 
                         : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                     }`}
                   >
                     <span className={isActive ? 'text-emerald-400' : ''}>{tab.icon}</span>
                     <span className="font-medium text-sm">{tab.name}</span>
                   </button>
                 );
               })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MagicCard className="p-8 bg-zinc-900/40 border-white/5 rounded-3xl space-y-8" gradientColor="rgba(255,255,255,0.03)">
                {activeTab === 'Profile' && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Profile Information</h3>
                      <p className="text-zinc-400 text-sm">Update your personal details here.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-orange-500/20 flex items-center justify-center text-white text-2xl font-bold border border-white/10 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
                          JD
                        </div>
                        <div className="space-y-2">
                          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl border border-white/10 transition-all"> 
                            Change Avatar
                          </button>
                          <p className="text-xs text-zinc-500">JPG, GIF or PNG. Max size of 800K</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">First Name</label>
                          <input type="text" defaultValue="Jane" className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Last Name</label>
                          <input type="text" defaultValue="Doe" className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Email Address</label>
                        <input type="email" defaultValue="jane@example.com" disabled className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-2.5 text-zinc-500 cursor-not-allowed" />
                        <p className="text-xs text-zinc-500">Your email address is managed through your connected provider.</p>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex justify-end">  
                        <button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-colors shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {activeTab !== 'Profile' && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} className="w-12 h-12 text-zinc-700 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">{activeTab} Settings</h3>
                    <p className="text-sm text-zinc-500 max-w-sm">This section is currently under construction. Check back soon for new configurable options.</p>
                  </div>
                )}
              </MagicCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
