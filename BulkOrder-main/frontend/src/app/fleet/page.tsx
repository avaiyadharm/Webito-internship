"use client";

import { useState, useEffect } from "react";
import { Server, Users, Shield, Globe, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Account {
  id: number;
  email: string;
  platform: string;
  is_active: boolean;
}

interface Proxy {
  id: number;
  ip_address: string;
  port: number;
  username?: string;
  is_active: boolean;
}

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<"accounts" | "proxies">("accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPlatform, setNewPlatform] = useState("Amazon");
  
  const [newIp, setNewIp] = useState("");
  const [newPort, setNewPort] = useState("");
  const [newProxyUser, setNewProxyUser] = useState("");
  const [newProxyPass, setNewProxyPass] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accRes, proxyRes] = await Promise.all([
        fetch("/api/fleet/accounts"),
        fetch("/api/fleet/proxies")
      ]);
      const accData = await accRes.json();
      const proxyData = await proxyRes.json();
      setAccounts(accData);
      setProxies(proxyData);
    } catch (e) {
      toast.error("Failed to fetch fleet data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return toast.error("Email and password required");
    
    try {
      const res = await fetch("/api/fleet/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password_hash: newPassword, platform: newPlatform })
      });
      if (res.ok) {
        toast.success("Bot account added successfully");
        setNewEmail(""); setNewPassword("");
        fetchData();
      } else throw new Error();
    } catch (e) {
      toast.error("Failed to add account");
    }
  };

  const handleAddProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp || !newPort) return toast.error("IP and Port required");
    
    try {
      const res = await fetch("/api/fleet/proxies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ip_address: newIp, 
          port: parseInt(newPort), 
          username: newProxyUser || null, 
          password: newProxyPass || null 
        })
      });
      if (res.ok) {
        toast.success("Proxy added successfully");
        setNewIp(""); setNewPort(""); setNewProxyUser(""); setNewProxyPass("");
        fetchData();
      } else throw new Error();
    } catch (e) {
      toast.error("Failed to add proxy");
    }
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await fetch(`/api/fleet/accounts/${id}`, { method: "DELETE" });
      toast.success("Account removed");
      fetchData();
    } catch (e) {
      toast.error("Failed to remove account");
    }
  };

  const handleDeleteProxy = async (id: number) => {
    try {
      await fetch(`/api/fleet/proxies/${id}`, { method: "DELETE" });
      toast.success("Proxy removed");
      fetchData();
    } catch (e) {
      toast.error("Failed to remove proxy");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Server className="w-6 h-6 text-indigo-600" />
          Bot Fleet Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage buyer accounts, residential proxies, and active automation sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${activeTab === "accounts" ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Users className="w-4 h-4" /> Buyer Accounts
          {activeTab === "accounts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("proxies")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${activeTab === "proxies" ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Globe className="w-4 h-4" /> Residential Proxies
          {activeTab === "proxies" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Table */}
        <div className="lg:col-span-2">
          <div className="minimal-card rounded-xl overflow-hidden shadow-sm border border-slate-200/60">
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                {activeTab === "accounts" ? <Shield className="w-4 h-4 text-emerald-500" /> : <Globe className="w-4 h-4 text-blue-500" />}
                {activeTab === "accounts" ? "Active Sessions" : "Proxy Pool"}
              </h2>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {activeTab === "accounts" ? accounts.length : proxies.length} Total
              </span>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider">
                  <tr>
                    {activeTab === "accounts" ? (
                      <>
                        <th className="px-5 py-3">Email Address</th>
                        <th className="px-5 py-3">Platform</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-5 py-3">IP Address</th>
                        <th className="px-5 py-3">Port</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-xs">Loading fleet data...</td></tr>
                  ) : activeTab === "accounts" && accounts.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-xs">No buyer accounts configured. Add one below.</td></tr>
                  ) : activeTab === "proxies" && proxies.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-xs">No residential proxies configured. Add one below.</td></tr>
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (activeTab === "accounts" ? accounts : proxies).map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        {activeTab === "accounts" ? (
                          <>
                            <td className="px-5 py-3 text-slate-800 font-medium">{item.email}</td>
                            <td className="px-5 py-3 text-slate-600">{item.platform}</td>
                            <td className="px-5 py-3">
                              {item.is_active ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3"/> Active</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3"/> Banned</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => handleDeleteAccount(item.id)} className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3 text-slate-800 font-mono text-xs">{item.ip_address}</td>
                            <td className="px-5 py-3 text-slate-600 text-xs font-mono">{item.port}</td>
                            <td className="px-5 py-3">
                              {item.is_active ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3"/> Online</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3"/> Offline</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => handleDeleteProxy(item.id)} className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Add Form */}
        <div className="lg:col-span-1">
          <div className="minimal-card rounded-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200/60 bg-white/50 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              Add {activeTab === "accounts" ? "Buyer Account" : "New Proxy"}
            </h3>

            {activeTab === "accounts" ? (
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="bot@domain.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform</label>
                  <select 
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Myntra">Myntra</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm mt-2">
                  Provision Account
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAddProxy} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">IP Address</label>
                  <input 
                    type="text" 
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="192.168.1.1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Port</label>
                  <input 
                    type="number" 
                    value={newPort}
                    onChange={(e) => setNewPort(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="8080"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auth User</label>
                    <input 
                      type="text" 
                      value={newProxyUser}
                      onChange={(e) => setNewProxyUser(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auth Pass</label>
                    <input 
                      type="password" 
                      value={newProxyPass}
                      onChange={(e) => setNewProxyPass(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm mt-2">
                  Bind Proxy
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
