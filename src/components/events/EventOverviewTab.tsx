import React from 'react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { Panel } from '@/components/ui/kit';

interface EventOverviewTabProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
}

export const EventOverviewTab: React.FC<EventOverviewTabProps> = ({ event, registrations }) => {
  const quota = event.quota || 100;
  const attendedCount = registrations.filter(r => r.is_attended).length;
  const percentage = Math.min(100, (registrations.length / quota) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
      <Panel className="md:col-span-2 p-5 space-y-4">
        <h2 className="text-base font-semibold text-ink">Informasi kegiatan</h2>
        {event.description ? (
          <p className="text-sm leading-relaxed text-ink-2 whitespace-pre-line">{event.description}</p>
        ) : (
          <p className="text-sm text-ink-3">Deskripsi belum diisi.</p>
        )}

        <div className="border-t border-line pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-ink">Catatan dan ketentuan</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-ink-2">
            <li>Umat diimbau berbusana rapi dan bersahaja.</li>
            <li>Harap hadir 15 menit sebelum pembacaan Paritta dimulai.</li>
            <li>Pendaftaran dapat dilakukan mandiri lewat Portal Umat atau di lokasi lewat pengurus.</li>
          </ul>
        </div>
      </Panel>

      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-ink">Kuota peserta</h2>
        <p className="text-sm text-ink-2">
          <span className="text-3xl font-bold tabular-nums text-brand">{registrations.length}</span> terdaftar
        </p>
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-sm">
          <dt className="text-ink-2">Kapasitas</dt>
          <dd className="text-right tabular-nums text-ink">
            {event.quota ? `${event.quota} orang` : <span className="text-ink-3">Belum diisi</span>}
          </dd>
          <dt className="text-ink-2">Hadir</dt>
          <dd className="text-right tabular-nums text-ink">{attendedCount} orang</dd>
        </dl>

        {event.quota ? (
          <div
            role="progressbar"
            aria-label="Kuota terisi"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percentage)}
            className="w-full h-2 rounded-sm bg-surface-2 overflow-hidden"
          >
            <div className="h-full bg-brand" style={{ width: `${percentage}%` }} />
          </div>
        ) : null}
      </Panel>
    </div>
  );
};
