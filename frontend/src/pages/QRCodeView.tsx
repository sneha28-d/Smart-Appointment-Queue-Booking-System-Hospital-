import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeView = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const qrValue = `${window.location.origin}/appointment/${appointmentId}`;
  const refCode = appointmentId?.toUpperCase().slice(0, 12) ?? 'DEMO';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20">
      <div className="w-full max-w-sm text-center">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-violet-200/40 border border-slate-100 p-10">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Booking Confirmed!</h1>
          <p className="text-slate-500 text-sm mb-7">Show this QR code at reception</p>

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 shadow-inner border border-slate-100 inline-block mb-5">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#1e293b"
              bgColor="#ffffff"
            />
          </div>

          {/* Ref */}
          <div className="bg-violet-50 rounded-xl border border-violet-100 px-4 py-3 mb-7">
            <p className="text-xs text-violet-500 font-semibold uppercase tracking-widest">Reference ID</p>
            <p className="text-lg font-black text-violet-700 tracking-widest mt-1"># {refCode}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/queue/${appointmentId}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Track Queue →
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <p className="text-slate-400 text-xs mt-5">
          Scan this QR at the hospital reception to check in automatically.
        </p>
      </div>
    </div>
  );
};

export default QRCodeView;
