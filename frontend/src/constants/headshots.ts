import ChrisGordon from '../assets/jpgs/Chris_Gordon.jpg';
import CaseyDixon from '../assets/jpgs/Casey_Dixon.jpg';
import BlakeDesRosiers from '../assets/jpgs/Blake_DesRosiers.jpeg';
import VanessaKorte from '../assets/jpgs/Vanessa_Korte.jpg';
import JaredRoy from '../assets/jpgs/Jared_Roy.jpg';
import GregLess from '../assets/jpgs/Greg_Less.jpg';
import CharlieBradley from '../assets/jpgs/Charlie_Bradley.jpg';
import AlyssaEmigh from '../assets/jpgs/Alyssa_Emigh.jpg';
import TeresaZbiciak from '../assets/jpgs/Teresa_Zbiciak.jpg';
import CharlieMichaels from '../assets/jpgs/Charlie_Michaels.jpg';
import DonWirkner from '../assets/jpgs/Don_Wirkner.jpg';
import MarkBrehob from '../assets/jpgs/Mark_Brehob.jpg';

const headshots: { [key: string]: { imgPath?: string, title: string, email?: string, phone?: string } } = {
    "Chris Gordon": { imgPath: ChrisGordon, title: "Director", email: "gordoncl@umich.edu", phone: "734-763-1224" },
    "Casey Dixon": { imgPath: CaseyDixon, title: "Manager", email: "kcdixon@umich.edu", phone: "734-615-3404" },
    "Blake DesRosiers": { imgPath: BlakeDesRosiers, title: "Lab Technician", email: "blakedes@umich.edu", phone: "734-615-6400" },
    "Vanessa Korte": { imgPath: VanessaKorte, title: "Administrative Assistant", email: "vkorte@umich.edu", phone: "734-763-0819" },
    "Jared Roy": { imgPath: JaredRoy, title: "Engineering Technician", email: "jaredroy@umich.edu", phone: "734-615-6400" },
    "Greg Less": { imgPath: GregLess, title: "Battery Lab Technical Director", email: "gless@umich.edu", phone: "734-764-2794" },
    "Charlie Bradley": { imgPath: CharlieBradley, title: "Instrument Maker", email: "charlesb@umich.edu", phone: "734-936-0335" },
    "Alyssa Emigh": { imgPath: AlyssaEmigh, title: "Makerspace Supervisor", email: "aemigh@umich.edu", phone: "734-615-0129" },
    "Marjorie Gaber": { title: "Design Labs Manager", email: "margaber@umich.edu", phone: "734-615-2844" },
    "Teresa Zbiciak": { imgPath: TeresaZbiciak, title: "Lab Manager" },
    "Charlie Michaels": { imgPath: CharlieMichaels, title: "Managing Director" },
    "Don Wirkner": { imgPath: DonWirkner, title: "Instructional Lab Services Manager", email: "dwirkner@umich.edu", phone: "734-763-7472" },
    "Mark Brehob": { imgPath: MarkBrehob, title: "Director", email: "brehob@umich.edu" },

};

export default headshots;