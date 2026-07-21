import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * 인증 · 보호자 프로필 · 펫 프로필 전역 상태 관리 훅
 * - 로그인 세션은 보호자(petlog_users) 단위
 * - 피드 활동(좋아요 · 댓글 · 팔로우)의 주체는 현재 선택된 펫(activePet)
 */

const AuthContext = createContext(null);
const ACTIVE_PET_KEY = 'petlog_active_pet';

/** 보호자 프로필 행이 없으면 가입 시 저장한 메타데이터로 생성 */
async function ensureProfile(user) {
  const { data: profile } = await supabase
    .from('petlog_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (profile) return profile;
  const meta = user.user_metadata ?? {};
  const { data: created } = await supabase
    .from('petlog_users')
    .insert({
      id: user.id,
      email: user.email,
      nickname: meta.nickname ?? user.email.split('@')[0],
      birth_date: meta.birth_date ?? '2000-01-01',
    })
    .select()
    .maybeSingle();
  return created;
}

/**
 * AuthProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 하위 트리 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetId] = useState(() => {
    const saved = localStorage.getItem(ACTIVE_PET_KEY);
    return saved ? Number(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (user) => {
    const prof = await ensureProfile(user);
    const { data: petRows } = await supabase
      .from('petlog_pet_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setProfile(prof ?? null);
    setPets(petRows ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const current = data.session;
      setSession(current);
      if (current?.user) {
        loadUserData(current.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      /* 비밀번호 재설정 링크로 진입한 경우 → 새 비밀번호 설정 화면으로 이동 */
      if (event === 'PASSWORD_RECOVERY') {
        window.location.hash = '#/reset-password';
      }
      /* onAuthStateChange 콜백 안에서 supabase 호출 시 교착 방지를 위해 큐로 미룸 */
      setTimeout(() => {
        if (next?.user) {
          loadUserData(next.user);
        } else {
          setProfile(null);
          setPets([]);
        }
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, [loadUserData]);

  /* 저장된 활성 펫이 없거나 목록에서 사라졌으면 첫 번째 펫으로 보정 */
  useEffect(() => {
    if (pets.length > 0 && !pets.some((p) => p.id === activePetId)) {
      setActivePetId(pets[0].id);
    }
  }, [pets, activePetId]);

  useEffect(() => {
    if (activePetId) localStorage.setItem(ACTIVE_PET_KEY, String(activePetId));
  }, [activePetId]);

  const refreshPets = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase
      .from('petlog_pet_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });
    setPets(data ?? []);
  }, [session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ACTIVE_PET_KEY);
    setActivePetId(null);
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    pets,
    activePet: pets.find((p) => p.id === activePetId) ?? pets[0] ?? null,
    setActivePetId,
    refreshPets,
    signOut,
    loading,
  }), [session, profile, pets, activePetId, refreshPets, signOut, loading]);

  return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}

/** 인증 컨텍스트 사용 훅 */
export function useAuth() {
  return useContext(AuthContext);
}
