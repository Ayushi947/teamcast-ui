'use client';

export function JobInvitesHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Job Invites</h1>
        <p className="text-muted-foreground">
          Manage job posting invites sent to candidates
        </p>
      </div>
    </div>
  );
}
