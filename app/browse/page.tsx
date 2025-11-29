// ... inside the .map() loop in BrowsePage ...

<div className="h-48 bg-gray-100 dark:bg-slate-800 relative">
  {artisan.avatar_url ? (
      <Image src={artisan.avatar_url} alt={artisan.full_name} fill className="object-cover group-hover:scale-105 transition duration-500" />
  ) : (
      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 dark:text-gray-600">
        {/* Fallback to first letter of name, or 'A' */}
        {artisan.full_name ? artisan.full_name.substring(0,1) : "A"}
      </div>
  )}
  {/* ... verified badge ... */}
</div>

<div className="p-4">
  <div className="flex justify-between items-start mb-2">
    <div>
      {/* Fallback Name */}
      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{artisan.full_name || "Artisan"}</h3>
      <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">{artisan.job_title || "Available"}</p>
    </div>
    {/* ... rest of card ... */}