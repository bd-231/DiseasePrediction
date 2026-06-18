import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PriorityBadge from '../components/common/PriorityBadge';
import StatusBadge from '../components/common/StatusBadge';
import { patientAPI } from '../api/client';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Loader2, Plus, Calendar, ShieldAlert, FileText, CheckCircle, Clock, ChevronRight, User } from 'lucide-react';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('submit');
  const [symptomList, setSymptomList] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cases state
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    date_of_birth: '',
    gender: '',
    blood_group: '',
    allergies: [],
    existing_conditions: [],
    current_medications: [],
    medical_history: ''
  });
  const [tempAllergies, setTempAllergies] = useState('');
  const [tempConditions, setTempConditions] = useState('');
  const [tempMeds, setTempMeds] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submittingCase, setSubmittingCase] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch initial list of symptoms
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const res = await patientAPI.getSymptoms();
        setSymptomList(res.data);
      } catch (err) {
        toast.error('Failed to load symptom list');
      }
    };
    fetchSymptoms();
  }, []);

  // Fetch list of cases when on "My Cases" tab
  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const res = await patientAPI.getCases();
      setCases(res.data);
    } catch (err) {
      toast.error('Failed to load cases list');
    } finally {
      setLoadingCases(false);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await patientAPI.getProfile();
      if (res.data) {
        setProfile({
          date_of_birth: res.data.date_of_birth || '',
          gender: res.data.gender || '',
          blood_group: res.data.blood_group || '',
          allergies: res.data.allergies || [],
          existing_conditions: res.data.existing_conditions || [],
          current_medications: res.data.current_medications || [],
          medical_history: res.data.medical_history || ''
        });
        setTempAllergies(res.data.allergies?.join(', ') || '');
        setTempConditions(res.data.existing_conditions?.join(', ') || '');
        setTempMeds(res.data.current_medications?.join(', ') || '');
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cases') {
      fetchCases();
      setSelectedCaseId(null);
      setCaseDetail(null);
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab]);

  const handleCaseSelect = async (id) => {
    setSelectedCaseId(id);
    setLoadingDetail(true);
    try {
      const res = await patientAPI.getCase(id);
      setCaseDetail(res.data);
    } catch (err) {
      toast.error('Failed to load case detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSearchQuery('');
  };

  const handleSymptomRemove = (symptom) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };

  const handleSubmitCase = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }
    setSubmittingCase(true);
    try {
      await patientAPI.submitCase({ symptoms_selected: selectedSymptoms });
      toast.success('Symptom case submitted successfully for doctor validation!');
      setSelectedSymptoms([]);
      setActiveTab('cases');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit case');
    } finally {
      setSubmittingCase(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    const updatedProfile = {
      ...profile,
      allergies: tempAllergies.split(',').map(s => s.trim()).filter(Boolean),
      existing_conditions: tempConditions.split(',').map(s => s.trim()).filter(Boolean),
      current_medications: tempMeds.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      await patientAPI.updateProfile(updatedProfile);
      toast.success('Clinical profile updated successfully');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update clinical profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredSymptoms = symptomList.filter(s =>
    s.toLowerCase().replace(/_/g, ' ').includes(searchQuery.toLowerCase()) &&
    !selectedSymptoms.includes(s)
  );

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        {/* Submit Case Tab */}
        {activeTab === 'submit' && (
          <div className="max-w-3xl mx-auto space-y-6 bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-primary-800">Submit New Symptom Case</h1>
              <p className="text-slate-500 text-sm">Select symptoms you are experiencing. An AI prediction will run and a physician will review it before recommending treatment.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-700 mb-2">Search Symptoms</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search symptoms (e.g. cough, headache, itching)..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400"
                  />
                  {searchQuery && (
                    <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                      {filteredSymptoms.length > 0 ? (
                        filteredSymptoms.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSymptomSelect(s)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors capitalize"
                          >
                            {s.replace(/_/g, ' ')}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-slate-400">No matching symptoms found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Symptoms */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Selected Symptoms ({selectedSymptoms.length})</h3>
                <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {selectedSymptoms.length === 0 ? (
                    <span className="text-xs text-slate-400 self-center pl-2">No symptoms selected yet.</span>
                  ) : (
                    selectedSymptoms.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-50 border border-secondary-200 rounded-full text-xs font-semibold text-secondary-800 capitalize"
                      >
                        {s.replace(/_/g, ' ')}
                        <button
                          onClick={() => handleSymptomRemove(s)}
                          className="hover:text-red-500 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSubmitCase}
                  disabled={submittingCase || selectedSymptoms.length === 0}
                  className="flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white disabled:opacity-50 px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  {submittingCase && <Loader2 size={16} className="animate-spin" />}
                  Submit to Medical Queue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Cases Tab */}
        {activeTab === 'cases' && (
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Case list left side */}
            <div className="w-full lg:w-80 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-primary-800">My Consultation Cases</h2>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loadingCases ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="animate-spin text-secondary-500" size={24} />
                  </div>
                ) : cases.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">No cases submitted yet</div>
                ) : (
                  cases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCaseSelect(c.id)}
                      className={`w-full text-left p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 border-l-4 ${
                        selectedCaseId === c.id ? 'bg-secondary-50/30 border-secondary-500' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">{formatDate(c.submitted_at)}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-sm font-semibold text-primary-800 truncate">
                        Symptoms: {c.symptoms_count} reported
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Priority: <span className="font-semibold capitalize text-slate-700">{c.priority_level}</span></span>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Case details right side */}
            <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              {!selectedCaseId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                  <FileText size={48} className="mb-3 text-slate-300" />
                  <p className="text-sm font-medium">Select a case from the list to view diagnosis details</p>
                </div>
              ) : loadingDetail ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="animate-spin text-secondary-500" size={32} />
                </div>
              ) : !caseDetail ? (
                <div className="flex-1 flex items-center justify-center text-sm text-red-500">Failed to load details.</div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Case Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h3 className="text-base font-bold text-primary-800">Consultation Case Details</h3>
                      <p className="text-xs text-slate-500">Submitted on {formatDate(caseDetail.submitted_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <PriorityBadge priority={caseDetail.priority_level} />
                      <StatusBadge status={caseDetail.status} />
                    </div>
                  </div>

                  {/* Symptoms Summary */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reported Symptoms</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseDetail.symptoms_selected?.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 capitalize">
                          {s.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Review Outcomes (Only visible if action is approved/modified/rejected) */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {caseDetail.doctor_action === 'pending' ? (
                      <div className="p-8 text-center bg-slate-50 flex flex-col items-center justify-center">
                        <Clock size={32} className="text-amber-500 animate-pulse mb-3" />
                        <h4 className="text-sm font-bold text-primary-800">Pending Physician Validation</h4>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          A medical doctor is currently reviewing your case. As per safety guidelines, diagnostic results and drug prescriptions are only made visible after doctor validation.
                        </p>
                      </div>
                    ) : caseDetail.doctor_action === 'rejected' ? (
                      <div className="p-8 text-center bg-red-50/50 flex flex-col items-center justify-center">
                        <ShieldAlert size={32} className="text-red-500 mb-3" />
                        <h4 className="text-sm font-bold text-red-800">Case Rejected by Doctor</h4>
                        <p className="text-xs text-red-700 max-w-sm mt-2">
                          <strong>Reason:</strong> {caseDetail.doctor_comments || 'Please contact support.'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-3 bg-green-50 border-b border-slate-200 flex justify-between items-center text-green-800">
                          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle size={14} />
                            Validated Consultation Report
                          </span>
                          <span className="text-xs">Reviewed: {formatDate(caseDetail.reviewed_at)}</span>
                        </div>
                        <div className="p-6 space-y-6 bg-white">
                          <div>
                            <span className="text-xs text-slate-400 uppercase font-semibold">Diagnosis (Confirmed Disease)</span>
                            <h4 className="text-lg font-bold text-primary-800 mt-1">{caseDetail.final_disease}</h4>
                          </div>

                          {caseDetail.doctor_comments && (
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Doctor's Notes & Advice</span>
                              <p className="text-sm text-primary-800 whitespace-pre-wrap">{caseDetail.doctor_comments}</p>
                            </div>
                          )}

                          {/* Prescribed Medications */}
                          <div>
                            <span className="text-xs text-slate-400 uppercase font-semibold block mb-3">Prescribed Medications</span>
                            <div className="overflow-hidden border border-slate-200 rounded-lg">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Medicine Name</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Dosage</th>
                                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Duration</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {caseDetail.final_medicines?.map((med, i) => (
                                    <tr key={i}>
                                      <td className="px-4 py-2.5 font-medium text-primary-800">{med.drugName}</td>
                                      <td className="px-4 py-2.5 text-slate-600">{med.dosage || '1 tablet'}</td>
                                      <td className="px-4 py-2.5 text-slate-500">{med.duration || '5 days'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-primary-800">Clinical Profile</h1>
              <p className="text-slate-500 text-sm">Maintain your medical details. These values help the AI filter out drugs that trigger allergies or interact with your active medicines.</p>
            </div>

            {loadingProfile ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="animate-spin text-secondary-500" size={24} />
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-5 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1.5">Gender</label>
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1.5">Blood Group</label>
                    <select
                      value={profile.blood_group}
                      onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Drug Allergies (Comma-separated)</label>
                  <input
                    type="text"
                    value={tempAllergies}
                    onChange={(e) => setAllergiesInput(e.target.value)}
                    placeholder="e.g. penicillin, aspirin, sulfa drugs"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">If empty, no drug recommendations will be automatically excluded.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Existing Conditions (Comma-separated)</label>
                  <input
                    type="text"
                    value={tempConditions}
                    onChange={(e) => setConditionsInput(e.target.value)}
                    placeholder="e.g. asthma, hypertension, diabetes"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Current Medications (Comma-separated)</label>
                  <input
                    type="text"
                    value={tempMeds}
                    onChange={(e) => setMedsInput(e.target.value)}
                    placeholder="e.g. metformin, lisinopril"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1.5">Medical History Summary</label>
                  <textarea
                    rows={4}
                    value={profile.medical_history}
                    onChange={(e) => setProfile({ ...profile, medical_history: e.target.value })}
                    placeholder="Summarize surgeries, chronic conditions, or general health history..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                  >
                    {savingProfile && <Loader2 size={16} className="animate-spin" />}
                    Save Clinical Profile
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  // Quick inputs helpers to sync state
  function setAllergiesInput(val) {
    setTempAllergies(val);
    setProfile(prev => ({ ...prev, allergies: val.split(',').map(s => s.trim()).filter(Boolean) }));
  }

  function setConditionsInput(val) {
    setTempConditions(val);
    setProfile(prev => ({ ...prev, existing_conditions: val.split(',').map(s => s.trim()).filter(Boolean) }));
  }

  function setMedsInput(val) {
    setTempMeds(val);
    setProfile(prev => ({ ...prev, current_medications: val.split(',').map(s => s.trim()).filter(Boolean) }));
  }
}
