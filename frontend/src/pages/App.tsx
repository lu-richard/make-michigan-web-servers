import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import type { ProfileData } from '../types/types';
import { apiGet } from '../lib/api';
import Navbar from '../components/Navbar';
import styles from '../styles/app.module.css';

// // Custom, reusable hook for fetching all data from Supabase necessary for UI
// const useAllData = () => {
//   const [makerspaces, setMakerspaces] = useState<MakerspacesById>({});
//   const [equipment, setEquipment] = useState<EquipmentById>({});
//   const [equipmentModels, setEquipmentModels] = useState<EquipmentModelById>({});
//   const [loading, setLoading] = useState(true);

//   // Helper function for fetching makerspace rows
//   const fetchMakerspaces = async (): Promise<Makerspace[]> => {
//     const { data, error } = await supabase.from('makerspaces').select();

//     if (error) {
//       throw Error("Failed to fetch makerspace data");
//     }

//     return data;
//   };

//   // Helper function for fetching equipment rows
//   const fetchEquipment = async (): Promise<Equipment[]> => {
//     const { data, error } = await supabase.from('equipment').select();

//     if (error) {
//       throw Error("Failed to fetch equipment data");
//     }

//     return data;
//   };

//   const fetchEquipmentModels = async(): Promise<EquipmentModel[]> => {
//     const { data, error } = await supabase.from('equipment_models').select();

//     if (error) {
//       throw Error("Failed to fetch equipment model data");
//     }

//     return data;
//   };

//   useEffect(() => {
//     const fetchAllPosts = async () => {
//       try {
//         const [makerspaceData, equipmentData, equipmentModelData] = await Promise.all([fetchMakerspaces(), fetchEquipment(), fetchEquipmentModels()]);

//         let makerspacesObj: MakerspacesById = {};
//         let equipmentObj: EquipmentById = {};
//         let equipmentModelObj: EquipmentModelById = {};

//         makerspaceData.forEach((makerspace) => makerspacesObj[makerspace["makerspace_id"]] = makerspace);
//         equipmentData.forEach((eq) => equipmentObj[eq["equipment_id"]] = eq);
//         equipmentModelData.forEach((eqModel) => equipmentModelObj[eqModel["equipment_model_id"]] = eqModel);

//         setMakerspaces(makerspacesObj);
//         setEquipment(equipmentObj);
//         setEquipmentModels(equipmentModelObj);
//       }
//       catch (e) {
//         console.error(e);
//       }
//       finally {
//         setLoading(false);
//       }
//     };

//     fetchAllPosts();
//   }, []);

//   return { makerspaces, equipment, equipmentModels, loading };
// };

function App() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // User whose profile is loaded or loading, so repeat auth events for the same user
  //   // (TOKEN_REFRESHED, SIGNED_IN on tab refocus) don't refetch it.
  //   let profileUserId: string | null = null;

  //   const fetchProfile = async (s: Session | null) => {
  //     if (!s) {
  //       profileUserId = null;
  //       setProfile(null);
  //       return;
  //     }

  //     if (s.user.id === profileUserId) {
  //       return;
  //     }

  //     profileUserId = s.user.id;

  //     try {
  //       const data = await apiGet<ProfileData>(`/profiles/${s.user.id}/`);
  //       setProfile(data);
  //     }
  //     catch (e) {
  //       // Allow a retry on the next auth event (e.g. SignUp's profile didn't exist yet).
  //       profileUserId = null;
  //       console.error((e as Error).message);
  //     }
  //   };

  //   // Supabase emits INITIAL_SESSION as soon as we subscribe, so no separate getSession() call is needed.
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     (event, session) => {
  //       fetchProfile(session).finally(() => {
  //         if (event === 'INITIAL_SESSION') {
  //           setLoading(false);
  //         }
  //       });
  //     }
  //   );

  //   return () => subscription.unsubscribe();
  // }, []);

  useEffect(() => {
    // Apache has already signed the user in with Okta before this page loads; Django resolves (and on first
    // login creates) their profile from the identity Apache forwards with this request.
    const fetchProfile = async () => {
      try {
        const data = await apiGet<ProfileData>('/me/');
        setProfile(data);
      }
      catch (e) {
        console.error((e as Error).message);
      }
      finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
      <AppContext.Provider value={{ profile, setProfile, loading }}>
        {
          profile &&
          <header>
            <Navbar />
          </header>
        }
        <main>
          <Outlet />
        </main>
        {
          profile &&
          <footer>
            <p className={styles.footer}>&copy; 2025 Make Michigan</p>
          </footer>
        }
      </AppContext.Provider>
  );
}

export default App;
