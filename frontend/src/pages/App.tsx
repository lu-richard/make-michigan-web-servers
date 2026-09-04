import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import type { Session } from '@supabase/supabase-js';
import type { ProfileData } from '../types/types';
import Navbar from '../components/Navbar';
import supabase from '../lib/supabase';
import styles from '../styles/app.module.css';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    const fetchProfile = async (s: Session | null) => {
      try {
        if (s) {
          const response = await fetch(`${VITE_API_BASE_URL}/profiles/${s.user.id}/`);

          if (!response.ok) {
            throw new Error(`Failed to fetch profile: ${response.status}`);
          }

          const data = await response.json();

          setProfile(data);
        }
        else {
          setProfile(null);
        }
      }
      catch (e) {
        throw e;
      }
    };

    const fetchInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await fetchProfile(session);
      }
      catch (e) {
        console.error((e as Error).message);
      }
      finally {
        setLoading(false);
      }
    };

    fetchInitialSession();
    // supabase.auth.getSession().then(
    //   ({ data: { session } }) => {
    //     setSession(session);
    //     fetchProfile(session);
    //   }
    // );

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchProfile(session);
      }
    );

    return subscription.unsubscribe;
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
