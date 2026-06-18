import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PriorityBadge from '../components/common/PriorityBadge';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { doctorAPI } from '../api/client';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Loader2, User, FileText, Check, Edit2, AlertCircle, RefreshCw, Trash2, Plus } from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('queue');
  const [queue, setQueue] = useState([]);
  const [casesHistory, setCasesHistory] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Modification form state
  const [modForm, setModForm] = useState({
    disease: '',
    comments: '',
    medicines: []
  });

  // Rejection form state
  const [rejectForm, setRejectForm] = useState({
    comments: ''
  });

  const fetchQueue = async () => {
    setLoadingList(true);
    try {
      const res = await doctorAPI.getQueue();
      setQueue(res.data);
    } catch (err) {
      toast.error('Failed to load patient queue');
    } finally {
      setLoadingList(false);
    }
  };

  const fetchReviewedCases = async () => {
    setLoadingList(true);
    try {
      const res = await doctorAPI.getReviewed();
      setCasesHistory(res.data);
    } catch (err) {
      toast.error('Failed to load reviewed cases');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueue();
    } else if (activeTab === 'cases') {
      fetchReviewedCases();
    }
    setSelectedCase(null);
    setCaseDetail(null);
  }, [activeTab]);

  const handleCaseSelect = async (c) => {
    setSelectedCase(c);
    setLoadingDetail(true);
    try {
      const res = await doctorAPI.getCase(c.id);
      setCaseDetail(res.data);
      // Pre-fill modification form in case they modify
      setModForm({
        disease: res.data.predicted_disease || '',
        comments: '',
        medicines: res.data.medicine_recommendations ? [...res.data.medicine_recommendations] : []
      });
    } catch (err) {
      toast.error('Failed to load case details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApprove = async () => {
    if (!caseDetail) return;
    setSubmitting(true);
    try {
      await doctorAPI.approveCase(caseDetail.id);
      toast.success('Case approved and signed off successfully');
      setCaseDetail(null);
      setSelectedCase(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to approve case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModify = () => {
    if (!caseDetail) return;
    setShowModifyModal(true);
  };

  const handleAddMedicine = () => {
    setModForm({
      ...modForm,
      medicines: [
        ...modForm.medicines,
        { drugName: '', dosage: '1 tablet', duration: '5 days', instructions: 'Take after meals', avg_rating: 10.0, conflict_flag: false }
      ]
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = [...modForm.medicines];
    updated.splice(index, 1);
    setModForm({ ...modForm, medicines: updated });
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...modForm.medicines];
    updated[index] = { ...updated[index], [field]: value };
    setModForm({ ...modForm, medicines: updated });
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    if (!modForm.disease.trim()) {
      toast.error('Disease name cannot be empty');
      return;
    }
    if (!modForm.comments.trim()) {
      toast.error('Please add comments explaining the modifications');
      return;
    }
    setSubmitting(true);
    try {
      await doctorAPI.modifyCase(caseDetail.id, modForm);
      toast.success('Case updated and signed off successfully');
      setShowModifyModal(false);
      setCaseDetail(null);
      setSelectedCase(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to modify case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectForm.comments.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setSubmitting(true);
    try {
      await doctorAPI.rejectCase(caseDetail.id, rejectForm);
      toast.success('Case rejected successfully');
      setShowRejectModal(false);
      setCaseDetail(null);
      setSelectedCase(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reject case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Queue List / Left Pane */}
        <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-semibold text-primary-800">
              {activeTab === 'queue' ? 'Patient Queue' : 'Reviewed Cases'}
            </h2>
            <button
              onClick={fetchQueue}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingList ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="animate-spin text-secondary-500" size={24} />
              </div>
            ) : activeTab === 'queue' ? (
              queue.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No cases found</div>
              ) : (
                queue.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCaseSelect(c)}
                    className={`w-full text-left p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 border-l-4 ${
                      selectedCase?.id === c.id ? 'bg-secondary-50/30 border-secondary-500' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{formatDate(c.submitted_at)}</span>
                      <PriorityBadge priority={c.priority_level} />
                    </div>
                    <p className="text-sm font-semibold text-primary-800">{c.patient_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      Symptoms: {c.symptoms_preview?.join(', ')}
                      {c.symptoms_count > 3 && ` (+${c.symptoms_count - 3} more)`}
                    </p>
                  </button>
                ))
              )
            ) : (
              casesHistory.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">No reviewed cases found</div>
              ) : (
                casesHistory.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCaseSelect(c)}
                    className={`w-full text-left p-4 hover:bg-slate-50/50 transition-colors flex flex-col gap-2 border-l-4 ${
                      selectedCase?.id === c.id ? 'bg-secondary-50/30 border-secondary-500' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">{formatDate(c.reviewed_at)}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm font-semibold text-primary-800">{c.patient_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      Symptoms: {c.symptoms_preview?.join(', ')}
                      {c.symptoms_count > 3 && ` (+${c.symptoms_count - 3} more)`}
                    </p>
                  </button>
                ))
              )
            )}
          </div>

        </div>

        {/* Case Detail / Right Pane */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          {!selectedCase ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <FileText size={48} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium">Select a patient case from the queue to start review</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-secondary-500" size={32} />
            </div>
          ) : !caseDetail ? (
            <div className="flex-1 flex items-center justify-center text-sm text-red-500">
              Failed to load case detail.
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Patient Info Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary-800">{caseDetail.patient?.name}</h3>
                    <p className="text-xs text-slate-500">
                      {caseDetail.patient?.gender ? `${caseDetail.patient.gender}, ` : ''}
                      {caseDetail.patient?.age ? `${caseDetail.patient.age} years old` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={caseDetail.priority_level} />
                  <StatusBadge status={caseDetail.status} />
                </div>
              </div>

              {/* Case Body Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Clinical History & Allergies */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Patient Profile</h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li><strong>Blood Group:</strong> {caseDetail.patient?.blood_group || 'Not Specified'}</li>
                      <li><strong>Medical History:</strong> {caseDetail.patient?.medical_history || 'None reported'}</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Risks & Medications</h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="text-red-600"><strong>Allergies:</strong> {caseDetail.patient?.allergies?.join(', ') || 'None reported'}</li>
                      <li><strong>Current Medications:</strong> {caseDetail.patient?.current_medications?.join(', ') || 'None reported'}</li>
                    </ul>
                  </div>
                </div>

                {/* Symptoms Selected */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Selected Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {caseDetail.symptoms_selected?.map((symptom, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-xs font-medium text-slate-700 transition-colors">
                        {symptom.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Prediction & Diagnosis */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-secondary-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-semibold text-secondary-800 uppercase tracking-wider">AI Prediction Engine</span>
                    <span className="text-xs text-slate-500">Confidence: {(caseDetail.prediction_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-4 bg-white flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Predicted Disease</p>
                      <h4 className="text-lg font-bold text-primary-800 mt-1">{caseDetail.predicted_disease}</h4>
                    </div>
                    {caseDetail.dangerous_combination_detected && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-medium">
                        <AlertCircle size={16} />
                        Dangerous combination detected!
                      </div>
                    )}
                  </div>
                </div>

                {/* Medicine Recommendations */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Medicine Recommendations</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Medicine Name</th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Avg Rating</th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-2">Conflict Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {caseDetail.medicine_recommendations?.map((med, i) => (
                          <tr key={i} className="hover:bg-slate-50/30">
                            <td className="px-4 py-2.5 font-medium text-primary-800">{med.drugName}</td>
                            <td className="px-4 py-2.5 text-slate-600">{med.avg_rating} / 10</td>
                            <td className="px-4 py-2.5">
                              {med.conflict_flag ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                  <AlertCircle size={12} />
                                  Active Medication Conflict
                                </span>
                              ) : (
                                <span className="text-xs text-green-600">None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {(!caseDetail.medicine_recommendations || caseDetail.medicine_recommendations.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-4 py-6 text-center text-xs text-slate-400">No drug recommendations available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex flex-wrap gap-3 justify-end items-center">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reject Case
                </button>
                <button
                  onClick={handleOpenModify}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 bg-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit2 size={14} />
                  Modify & Approve
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Approve AI Diagnosis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modify & Approve Modal */}
      <Modal isOpen={showModifyModal} onClose={() => setShowModifyModal(false)} title="Modify AI Recommendations" size="lg">
        <form onSubmit={handleModifySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Diagnosis Override</label>
            <input
              type="text"
              value={modForm.disease}
              onChange={(e) => setModForm({ ...modForm, disease: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-primary-700">Prescribed Medicines</label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="flex items-center gap-1 text-xs font-semibold text-secondary-600 hover:text-secondary-700 transition-colors"
              >
                <Plus size={12} />
                Add Custom Medicine
              </button>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {modForm.medicines.map((med, index) => (
                <div key={index} className="flex gap-2 items-center bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={med.drugName}
                      onChange={(e) => handleMedicineChange(index, 'drugName', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={med.dosage || ''}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="text"
                      placeholder="Duration"
                      value={med.duration || ''}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {modForm.medicines.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No medicines prescribed. Click add to add one.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Doctor Comments & Instructions</label>
            <textarea
              rows={3}
              value={modForm.comments}
              onChange={(e) => setModForm({ ...modForm, comments: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
              placeholder="Provide dosage instructions, lifestyle advice, or reasons for diagnostic modifications..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowModifyModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-secondary-500 hover:bg-secondary-600 disabled:opacity-50 rounded-lg transition-all"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Save & Sign off
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Case Submission" size="sm">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            This will reject the patient case and notify the patient. You must explain the reason for rejection (e.g. invalid symptoms, requires physical checkup).
          </p>
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">Reason for Rejection</label>
            <textarea
              rows={3}
              value={rejectForm.comments}
              onChange={(e) => setRejectForm({ comments: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
              placeholder="Reason for rejection..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-all"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Reject Case
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
