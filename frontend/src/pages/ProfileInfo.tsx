import React, { useEffect, useState } from 'react'
import labels from "../constants/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfileData } from '@/types/types';
import { Separator } from '@/components/ui/separator';

// Keep React in scope for JSX linting, without triggering unused-import warnings.
void React;

type ProfileInfoProps = {
  profilePhoto: string;
  profile: ProfileData;
};

const ProfileInfo = ({ profilePhoto, profile }: ProfileInfoProps) => {

    const [skills, setSkills] = useState<string[]>([])
    const [teams, setTeams] = useState<string[]>([])
    const [bio, setBio] = useState<string>("")
    const [makerLevel, setMakerLevel] = useState<string>("")

    useEffect(() => {
        setSkills(["Coding", "3D Printing", "Prototyping", "CAD", "Embedded Systems"])
        setTeams(["EcoData", "TechPlus", "M-Fly"])
        setBio("Click Edit to Change")
        setMakerLevel("Learner")
    }, [])

  return (
    <div className="w-full pb-16">
        <h1 className="H1 scroll-m-20 text-3xl font-bold tracking-tight md:text-4xl mb-6">
            My Profile
        </h1>
        <Card className="relative w-full flex flex-row items-center gap-6 p-6">
            <button
                type="button"
                className="absolute top-6 right-6 text-sm font-medium text-arb-blue"
            >
                Edit
            </button>
            <div className="w-40 h-auto rounded-full overflow-hidden shrink-0">
                <img src={profilePhoto} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 pr-16 sm:pr-20">
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {profile!["first_name"]}{" "}
                        {profile!["middle_initial"] && profile!["middle_initial"] + ". "}
                        {profile!["last_name"]}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {profile!.pronouns && <p className="font-light mt-3">{profile!.pronouns}</p>}
                    <p className="mt-4 font-light">
                        {profile!.uniqname}@umich.edu
                    </p>
                    {profile!.roles && (
                        <div className="mt-10 flex flex-wrap gap-3">
                            {profile!.roles.map((role) => (
                                <p
                                    key={role}
                                    className="rounded-3xl border border-neutral-300 px-5 py-2 text-xl"
                                >
                                    {labels[role]}
                                </p>
                            ))}
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
        <div className='mt-12 relative'>
            <button
                type="button"
                className="absolute top-0 right-6 text-sm font-medium text-arb-blue"
            >
                Edit
            </button>
            <h2 className="H1 scroll-m-20 text-xl font-bold tracking-tight md:text-2xl mb-6">
                Personal Info
            </h2>
            <span className='flex items-center gap-16'>
                <div>
                    <h3 className='text-angell-ash'>Email:</h3>
                    <p>{profile.uniqname}.umich.edu</p>
                </div>
                <div>
                    <h3 className='text-angell-ash'>Phone:</h3>
                    <p>+1 734 567 9458</p>
                </div>
            </span>
        </div>
        <Separator className='my-12'/>
        <div className='relative'>
            <button
                type="button"
                className="absolute top-0 right-6 text-sm font-medium text-arb-blue"
            >
                Edit
            </button>
            <h2 className="H1 scroll-m-20 text-xl font-bold tracking-tight md:text-2xl mb-6">
                About
            </h2>
            <div className="grid grid-cols-[2fr_5fr] grid-rows-2 gap-6">
                <div>
                    <h3 className='text-angell-ash'>Project Teams</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {teams.map((p) => (
                            <div
                                key={p}
                                className="text-black text-sm px-0.5"
                            >
                                {p}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className='text-angell-ash'>Makerspace Level</h3>
                    <p className='text-sm'>{makerLevel}</p>
                </div>
                <div>
                    <h3 className='text-angell-ash'>Skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {skills.map((s) => (
                            <div
                                key={s}
                                className="rounded border border-angell-ash text-angell-ash text-sm px-0.5"
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className='text-angell-ash'>Bio</h3>
                    <p className='text-sm'>{bio}</p>
                </div>
            </div>
        </div>
        <Separator className='my-12'/>
        <div className='relative'>
            <button
                type="button"
                className="absolute top-0 right-6 text-sm font-medium text-arb-blue"
            >
                Edit
            </button>
            <h2 className="H1 scroll-m-20 text-xl font-bold tracking-tight md:text-2xl mb-6">
                Social Links
            </h2>
            <div>
                GitHub goes here
            </div>
            <div>
                LinkedIn goes here
            </div>
        </div>
    </div>

  )
}

export default ProfileInfo