import { useState, useEffect } from 'react';
import { supabase, TutorProfile, Profile } from '../lib/supabase';
import { Search, Star, BookOpen } from 'lucide-react';

interface TutorWithProfile extends TutorProfile {
  profiles: Profile;
}

export const TutorSearch = ({ onSelectTutor }: { onSelectTutor: (tutor: TutorWithProfile) => void }) => {
  const [tutors, setTutors] = useState<TutorWithProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(`
          *,
          profiles (*)
        `)
        .order('rating', { ascending: false });

      if (error) throw error;
      setTutors(data as TutorWithProfile[]);
    } catch (error) {
      console.error('Error loading tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter((tutor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tutor.profiles.full_name.toLowerCase().includes(searchLower) ||
      tutor.skills.some((skill) => skill.toLowerCase().includes(searchLower)) ||
      tutor.bio.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-600">Loading tutors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, skill, or subject..."
          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTutors.map((tutor) => (
          <div
            key={tutor.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 border border-slate-200"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {tutor.profiles.full_name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-slate-700">
                  {tutor.rating.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm">
                  ({tutor.total_reviews} reviews)
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 line-clamp-3">
              {tutor.bio || 'No bio available'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tutor.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {tutor.skills.length > 3 && (
                <span className="text-slate-500 text-xs px-2 py-1">
                  +{tutor.skills.length - 3} more
                </span>
              )}
            </div>

            <button
              onClick={() => onSelectTutor(tutor)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Book Session
            </button>
          </div>
        ))}
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No tutors found matching your search</p>
        </div>
      )}
    </div>
  );
};
