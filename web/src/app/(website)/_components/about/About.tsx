/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { BiLogoDribbble, BiLogoLinkedinSquare } from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";

import aboutImage from "../../../../../public/assets/images/about-us.jpg";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  social: { icon: any; link: string }[];
}

export function About() {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Doe",
      title: "Program Director",
      description:
        "John leads our programs, ensuring impactful training for African youth.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      title: "Mentorship Coordinator",
      description:
        "Jane connects mentors with teens, fostering growth and development.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 3,
      name: "Michael Brown",
      title: "Marketing Specialist",
      description:
        "Michael crafts our message to inspire and engage the youth.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 4,
      name: "Sarah Johnson",
      title: "Tech Advisor",
      description:
        "Sarah guides our tech initiatives, ensuring modern skills are taught.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 5,
      name: "David Lee",
      title: "Finance Manager",
      description:
        "David manages our budget, ensuring resources are allocated effectively.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 6,
      name: "Emily Davis",
      title: "Content Creator",
      description:
        "Emily creates engaging content to promote our mission and programs.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 7,
      name: "Chris Wilson",
      title: "Community Liaison",
      description:
        "Chris builds partnerships with local organizations to enhance our outreach.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
    {
      id: 8,
      name: "We're hiring!",
      title: "Join us",
      description:
        "Be part of our mission to empower African youth through skills and mentorship.",
      image: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg",
      social: [
        { icon: <BiLogoLinkedinSquare className="size-6" />, link: "#" },
        { icon: <FaXTwitter className="size-6 p-0.5" />, link: "#" },
        { icon: <BiLogoDribbble className="size-6" />, link: "#" },
      ],
    },
  ];

  return (
    <div className="px-[5%]">
      <section className="py-10 md:py-24">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-12 lg:gap-x-20">
            <div>
              <h2 className="mb-3 text-3xl font-semibold text-primary-600">
                Our Journey: Empowering Africa&apos;s Future Leaders
              </h2>
              <p className="text-gray-700 md:text-base">
                Founded with a vision to transform the lives of African
                teenagers, GrowTeens is dedicated to equipping youth with
                essential skills for the modern workforce. Our goal is to foster
                a generation of innovative leaders who can thrive in a rapidly
                changing global economy.
              </p>
            </div>
            <div>
              <Image
                src={aboutImage}
                alt="About Us"
                className="w-full object-cover"
                width={1000}
                height={1000}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-lg text-center">
          <h3 className="mb-5 text-5xl font-bold text-primary-600">Our Team</h3>
          <p className="md:text-lg">
            Meet the passionate individuals driving our mission forward.
          </p>
        </div>
        <div className="grid grid-cols-1 items-start justify-center gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col text-center">
              <div className="relative mb-5 size-full overflow-hidden pt-[66%] md:mb-6 md:pt-[100%]">
                <img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              <div className="mb-3 md:mb-4">
                <h5 className="text-md font-semibold md:text-lg">
                  {member.name}
                </h5>
                <h6 className="md:text-md">{member.title}</h6>
              </div>
              <p className="text-gray-700">{member.description}</p>
              <div className="mt-6 grid grid-flow-col grid-cols-[max-content] gap-3.5 self-center">
                {member.social.map((socialItem, index) => (
                  <a key={index} href={socialItem.link}>
                    {socialItem.icon}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
