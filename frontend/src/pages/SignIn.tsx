import supabase from '../lib/supabase';
import { useState } from 'react';
import { Link } from 'react-router-dom';
// import styles from '../styles/signUpIn.module.css';
import Loading from './Loading';

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // const { setProfile } = useContext(AppContext);

    // Function for signing the user in
    const signInUser = async () => {
        try {
            setLoading(true);

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw new Error("Failed to sign in user");
            }
        }
        catch (e) {
            console.error(e);
            setErrorMessage("Login failed. Please check your credentials and try again.");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            {
                loading ? <div className="h-[100vh]"><Loading /></div> :
                <div className="flex flex-col justify-center items-center h-screen bg-navy-blue">
                    <div className="p-12 bg-main-bg rounded-3xl w-[40vw]">
                        <h1 className="text-2xl font-semibold">Sign In</h1>
                        <div className="my-6 text-xl">
                            <p>U-M Email</p>
                            <input type="email" value={email} placeholder="name@umich.edu" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Password</p>
                            <input type="password" value={password} placeholder="Your Password" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button type="button" className="bg-arb-blue py-3 px-5 rounded-3xl text-[#fff]" onClick={signInUser}>Sign In</button>
                        <p className="text-[red] mt-4 mb-6">{errorMessage}</p>
                        <Link to="/signup" className="italic text-arb-blue hover:text-navy-blue">Need to create an account? Sign up here.</Link>
                    </div>
                </div>
            }
        </>
    );
}

export default SignIn;