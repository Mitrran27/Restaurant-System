import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Truck, UtensilsCrossed } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Fast Delivery', desc: 'Hot to your door in 30 min' },
  { icon: UtensilsCrossed, title: 'Dine In', desc: 'Scan your table QR code' },
  { icon: Clock, title: 'Pickup Ready', desc: 'Order ahead, skip the wait' },
  { icon: Star, title: 'Top Rated', desc: '4.9★ from 2,400+ reviews' },
];

const featured = [
  { name: 'Double Smash Burger', desc: 'Crispy edges, juicy center', price: '$16.99', img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600', tag: '🔥 Most Popular' },
  { name: 'Truffle Mushroom Pizza', desc: 'Stone-baked, truffle oil', price: '$19.99', img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600', tag: '⭐ Chef\'s Pick' },
  { name: 'Chocolate Lava Cake', desc: 'Warm, molten center', price: '$7.99', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', tag: '🍫 Dessert Fave' },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-espresso py-20 lg:py-32">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #8B5E3C 0%, transparent 60%), radial-gradient(circle at 80% 20%, #C4956A 0%, transparent 50%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block badge bg-brand-500/20 text-brand-200 border border-brand-400/30 mb-6 text-sm">
            🍽️ Now open for dine-in & delivery
          </span>
          <h1 className="font-display text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Crafted with <span className="text-latte italic">passion,</span><br />served with love.
          </h1>
          <p className="text-cream-300 text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
            Premium burgers, stone-baked pizzas, and handcrafted drinks. Order online, scan your table, or walk in.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/menu" className="btn-primary text-base px-8 py-3 flex items-center gap-2">
              Order Now <ArrowRight size={18} />
            </Link>
            <Link to="/menu" className="text-cream-300 hover:text-white flex items-center gap-2 font-medium transition-colors">
              View Full Menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-3">
                  <Icon size={22} className="text-brand-500" />
                </div>
                <h3 className="font-semibold text-espresso mb-1">{title}</h3>
                <p className="text-sm text-brand-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-400 text-sm font-medium uppercase tracking-widest mb-2">Our Favourites</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-espresso">Most Loved Dishes</h2>
          </div>
          <Link to="/menu" className="btn-ghost flex items-center gap-1 text-sm hidden sm:flex">
            See all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((item) => (
            <Link key={item.name} to="/menu" className="card group hover:-translate-y-1 transition-transform duration-300">
              <div className="relative h-52 overflow-hidden">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 badge bg-white/90 text-espresso text-xs shadow">{item.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-espresso mb-1">{item.name}</h3>
                <p className="text-sm text-brand-400 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-brand-600 font-semibold text-lg">{item.price}</span>
                  <span className="btn-primary text-sm py-1.5 px-4">Add to cart</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-brand-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
            Dining in? Scan your table QR
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Seated at a table? Scan the QR code on your table to order directly from your phone — no app needed.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-xl px-6 py-3 font-medium">
            📱 Look for the QR code on your table
          </div>
        </div>
      </section>
    </div>
  );
}
