// ... inside DynamicProfilePage return ...

{/* AVATAR */}
<div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden -mt-16 sm:-mt-20 bg-gray-200 dark:bg-slate-800">
  {profile.avatar_url ? (
      <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
  ) : (
      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
        {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : "??"}
      </div>
  )}
</div>

<div className="text-center sm:text-left mb-2">
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
    {profile.full_name || "Unknown Artisan"}
    <ShieldCheck className="w-6 h-6 text-green-600" />
  </h1>
  {/* ... */}