import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, PhoneCall, ExternalLink, Globe, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About Platform */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#002D62] text-amber-400 flex items-center justify-center font-bold text-sm border border-sky-400">
                IMD
              </div>
              <span className="font-bold text-white text-sm">CAPACITY CONNECT</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('app.portalDesc')}
            </p>
            <div className="flex items-center space-x-2 text-slate-400">
              <MapPin size={14} className="text-sky-400 flex-shrink-0" />
              <span>Mausam Bhavan, Lodhi Road, New Delhi 110003</span>
            </div>
          </div>

          {/* Col 2: Operational Centers */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Key Meteorology Divisions
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Radar Meteorology & Nowcasting Division</li>
              <li>National Cyclone Warning Centre (NCWC)</li>
              <li>Numerical Weather Prediction (NWP) Modeling</li>
              <li>Surface AWS & Telemetry Instrumentation</li>
              <li>Satellite Meteorology Division (INSAT-3D/3DR)</li>
            </ul>
          </div>

          {/* Col 3: Government & Global Portals */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Institutional Links
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="https://mausam.imd.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <Globe size={13} />
                  <span>IMD Official Portal (mausam.imd.gov.in)</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://moes.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <Globe size={13} />
                  <span>Ministry of Earth Sciences (MoES)</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://public.wmo.int"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <Globe size={13} />
                  <span>World Meteorological Organization (WMO)</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ncmrwf.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5"
                >
                  <Globe size={13} />
                  <span>NCMRWF Noida (Weather Modeling)</span>
                  <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Helpline & Compliance */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Support & Verification
            </h4>
            <div className="p-3 bg-slate-800 rounded border border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <PhoneCall size={14} />
                <span>IMD Technical Support Desk</span>
              </div>
              <p className="text-slate-300 text-xs">Toll-Free: 1800-180-1717</p>
              <p className="text-slate-400 text-[11px]">Direct: +91 11 2461 1068</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
              <ShieldCheck size={14} />
              <span>WCAG 2.1 AA Compliant & ISO 9001:2015</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© 2026 India Meteorological Department, Ministry of Earth Sciences. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">Security Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Use</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Screen Reader Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
