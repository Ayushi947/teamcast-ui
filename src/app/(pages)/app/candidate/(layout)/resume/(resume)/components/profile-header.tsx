export const ProfileHeader = () => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="mb-2 flex items-center">
          <h1 className="text-primary dark:text-muted-foreground text-2xl font-bold">
            Resume & Profile
          </h1>
        </div>
        <p className="text-md text-gray-600 dark:text-gray-400">
          Manage your professional profile and get AI-powered assessments to
          improve your job prospects.
        </p>
      </div>
    </div>
  );
};
