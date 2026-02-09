import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F14] py-12 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Tu7fa</h3>
            <p className="text-gray-400 text-sm">Connecting clients with skilled maalems.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">For Clients</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[#D4E96E] hover:opacity-75 transition-opacity duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/maalem" className="text-gray-400 hover:text-[#D4E96E] hover:opacity-75 transition-opacity duration-200">
                  Maalems
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">For Maalems</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register/maalem" className="text-gray-400 hover:text-[#D4E96E] hover:opacity-75 transition-opacity duration-200">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/login/maalem" className="text-gray-400 hover:text-[#D4E96E] hover:opacity-75 transition-opacity duration-200">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#D4E96E] hover:opacity-75 transition-opacity duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-[#D4E96E] hover:opacity-75 transition-opacity duration-200">
                  Help
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8">
          <p className="text-gray-400 text-sm text-center">&copy; 2023 Tu7fa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}