import React from 'react'
import LandingNavbar from './LandingNavbar'
import LandingHero from './LandingHero'
import LandingAbout from './LandingAbout'
import LandingServices from './LandingServices'
import LandingHowItWorks from './LandingHowItWorks'
import LandingImpact from './LandingImpact'
import LandingTeam from './LandingTeam'
import LandingMentors from './LandingMentors'
import LandingContact from './LandingContact'
import LandingFooter from './LandingFooter'

export default function LandingPage({ onLaunchDashboard, onNavigateAuth }) {
  return (
    <div className="min-h-screen w-full bg-[#F5F3ED] text-[#34434A] flex flex-col overflow-x-hidden selection:bg-[#315E4A] selection:text-white">
      {/* Navbar */}
      <LandingNavbar
        onLaunchDashboard={onLaunchDashboard}
        onNavigateAuth={onNavigateAuth}
      />

      {/* Main scrollable body */}
      <main className="flex-1 flex flex-col w-full">
        <LandingHero
          onLaunchDashboard={onLaunchDashboard}
          onNavigateAuth={onNavigateAuth}
        />
        <LandingAbout />
        <LandingServices onLaunchDashboard={onLaunchDashboard} />
        <LandingHowItWorks />
        <LandingImpact onLaunchDashboard={onLaunchDashboard} />
        <LandingTeam />
        <LandingMentors />
        <LandingContact />
      </main>

      <LandingFooter />
    </div>
  )
}
