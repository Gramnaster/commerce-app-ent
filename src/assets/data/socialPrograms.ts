import { Social01, Social02, Social03, Social04 } from "../images";

export interface socialPrograms {
  id: number,
  img: string,
  title: string,
  description: string,
  contactNumber: string,
  website: string,
}

export const socialPrograms = [
  { id: 0, img: Social01, title: "Bantay Bata 163", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", contactNumber: "+63 2 8924-3333", website: "https://www.abs-cbnfoundation.com/bantay-bata-163" },
  { id: 1, img: Social02, title: "Immune Deficiency Foundation", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", contactNumber: "+63 2 8721-5648", website: "https://primaryimmune.org" },
  { id: 2, img: Social03, title: "Doctors Without Borders", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", contactNumber: "+63 2 8845-7890", website: "https://www.msf.org" },
  { id: 3, img: Social04, title: "UNICEF Philippines", description: "We promise not to steal your money this time and our children will not brag about their excessive wealth on social media. They shall toil the mines like every other children instead. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", contactNumber: "+63 2 8901-0100", website: "https://www.unicef.org/philippines" },
];