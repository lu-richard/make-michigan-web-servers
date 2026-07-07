import supabase from "../lib/supabase";
import { useState } from "react";
// import styles from '../styles/signUpIn.module.css';
import { Link } from "react-router-dom";
import Loading from "./Loading";

function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [uniqname, setUniqname] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Funtion for signing a new user up
    const signUpUser = async () => {
        try {
            setLoading(true);

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        uniqname,
                    }
                }
            });

            if (error) {
                throw new Error(`${error}`);
            }
        }
        catch (e) {
            console.error(e);
            setErrorMessage("Sign up failed. Please check your account does not already exist and try again.");
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
                        <h1 className="text-2xl font-semibold">Sign Up</h1>
                        <div className="my-6 text-xl">
                            <p>U-M Email</p>
                            <input type="email" value={email} placeholder="name@umich.edu" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Password</p>
                            <input type="password" value={password} placeholder="Your Password" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md"onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>First Name</p>
                            <input type="text" value={firstName} placeholder="Jane" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>Last Name</p>
                            <input type="text" value={lastName} placeholder="Doe" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <div className="my-6 text-xl">
                            <p>U-M Uniqname</p>
                            <input type="text" value={uniqname} placeholder="janedoe" className="p-2 text-[0.95rem] w-full mt-1.5 border rounded-md" onChange={(e) => setUniqname(e.target.value)} />
                        </div>
                        <button type="button" className="bg-arb-blue py-3 px-5 rounded-3xl text-[#fff]" onClick={signUpUser}>Sign Up</button>
                        <p className="text-[red] mt-4 mb-6">{errorMessage}</p>
                        <Link to="/signin" className="italic text-arb-blue hover:text-navy-blue">Already have an account? Sign in here.</Link>
                    </div>
                </div>
            }
        </>
    ); 
}

export default SignUp;