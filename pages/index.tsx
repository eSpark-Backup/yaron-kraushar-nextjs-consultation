import React from 'react';
import Link from 'next/link'
import JimpleLogo from './components/jimple-logo';
import { useState, useEffect } from 'react';
import Shapes from "./components/Shapes";


import Slideshow from './components/Slideshow';
import BitSplash from "./components/BitSplash";
import RotatingPhone from "./components/RotatingPhone";


import axios from 'axios';
import { useRouter } from 'next/router';
import RotatingKey from './components/RotatingKey';
import Image from 'next/image'


const fetchUserLocation = async () => {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    return response.data.country_code;
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
};

function Index() {
  const myAnimations = ['animate__bounce', 'animate__wobble', 'animate__tada', 'animate__heartBeat'];
  const [animationClass, setAnimationClass] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {

    function setRandomAnimation() {
      const randomIndex = Math.floor(Math.random() * myAnimations.length);
      setAnimationClass(myAnimations[randomIndex]);
    }
    const intervalId = setInterval(setRandomAnimation, 2000);

    //check if ip is in australia 
    fetchUserLocation().then((location) => {
      console.log("Location:", location);

      switch (location) {
        case "AU":
          setPrice("AUD $34.95 per month/user");
          break;
        case "US":
          setPrice("USD $34.95 per month/user");
          break;
        case "GB":
          setPrice("GBP £25.95 per month/user");
          break;
        default:
          setPrice("USD $34.95 per month/user");
      }
    }
    );

    return () => clearInterval(intervalId);
  }, );



  const router = useRouter();

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        behavior: "smooth",
        top: element.offsetTop
      });
    }
  };



  return (



    
    <div>

      {/* Header */}
      <header className="fixed z-40 top-0 left-0 right-0 p-2 bg-zinc-900/60 flex flex-col sm:flex-row justify-between items-center">
      <div onClick={() => handleScroll('home')} className="cursor-pointer">
        <div className="flex">
            <JimpleLogo className={`relative ml-6 z-40 w-12 h-12 md:w-12 md:h-12`} />
            <div className="mt-2 ml-4 text-2xl font-bold text-white text-left relative">Jimple</div>
            </div>
      </div>
      
      <nav className="flex justify-center flex-grow mb-4 sm:mb-0 sm:mr-8">
        <a onClick={() => handleScroll('about')} className="text-blue-500   text-center text-xs md:text-lg    py-2 px-6 md:py-3 md:px-4 mr-2 md:mr-6 hover:cursor-pointer hover:bg-blue-700 hover:text-white bg-zinc-900 rounded-full">About</a>
        <a onClick={() => handleScroll('what')} className="text-green-500   text-center text-xs md:text-lg    py-2 px-6 md:py-3 md:px-4 mr-2 md:mr-6 hover:cursor-pointer hover:bg-green-700 hover:text-white bg-zinc-900 rounded-full">What</a>
        <a onClick={() => handleScroll('parents')} className="text-rose-500 text-center text-xs md:text-lg    py-2 px-6 md:py-3 md:px-4 hover:cursor-pointer hover:bg-rose-700 hover:text-white bg-zinc-900 rounded-full">For Parents</a>
      </nav>
      
     
      <a href="mailto:info@jimple.io?subject=Website%20Enquiry" className="md:absolute md:right-12  flex items-center text-xs md:text-lg py-2 px-6 justify-center hover:bg-indigo-600 bg-indigo-700 text-center hover:cursor-pointer hover:text-white rounded-full">Contact Us</a>


    </header>
      


      {/* Banner */}

      <div id="home"></div>
    
      

<div className="container mx-auto px-12 lg:px-32 mt-32" >
  <div className="flex flex-wrap content-center">
    <div className="w-full md:w-1/2 content-center z-20">  
          <p className="mt-24 text-4xl lg:text-5xl font-bold text-white text-left">Your voice matters. <br></br>Let it be heard.</p>
          <p className="mt-8 text-xl text-gray-400 font-light lg:text-2xl">Jimple is an AI-powered AAC platform is designed to help you communicate and express yourself effortlessly.</p>

          <div className="flex justify-left mt-10">
          <Link href="https://apps.apple.com/au/app/jimple/id6474167499">
              <Image
                src="/icon-download-ios.png"
                alt="iOS Logo"
                width={192} // Set the width and height explicitly for best optimization
                height={192} // Adjust these values based on your image's actual dimensions
                className="w-48 mr-8"
              />
            </Link>
            <Link href="https://play.google.com/store/apps/details?id=com.jimple.jimplechat&pcampaignid=web_share">
            <Image
              src="/icon-download-android.png"
              alt="Android Logo"
              width={192} // Set the width and height explicitly for best optimization
              height={192} // Adjust these values based on your image's actual dimensions
              className="w-48 mr-8 mb-8 ml-4"
            />
          </Link>
          </div>
        </div>
        <div className="w-full hidden md:flex md:w-1/2 z-20 flex-col justify-top items-center">  
          <div className="relative w-[400px] h-0 rotate-6" style={{ paddingBottom: '580px' }}>
              <div className={`absolute inset-0`}>
                <Image
                  src="/i_hero01.png"
                  alt="hero"
                  layout="fill"
                  className="object-cover"
                />
              </div>
          </div>
        </div> 
  </div>
</div>





{/* Reduce response time by 90% with Jimple - craft timely responses and stay in the flow of the conversation without missing a moment. */}



{/* <div className="py-8">
      <div className=" mx-auto flex justify-center">
        <div className="w-full md:w-1/4">
          <div className="bg-blue-500 p-6 h-80">
            <h2 className="text-4xl font-bold mb-2">Redesigned</h2>
            <p className="font-light text-white text-md md:text-xl">Smart, efficient, enhances comprehension and super-charges self-expression.</p>
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <div className="bg-green-500 p-6 h-80">
            <h2 className="text-4xl  font-bold mb-2">Adaptive</h2>
            <p className="font-light text-white text-md md:text-xl">Smart, efficient, enhances comprehension and super-charges self-expression.</p>
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <div className="bg-rose-500 p-6 h-80">
            <h2 className="text-4xl font-bold mb-2">Efficient</h2>
            <p className="font-light text-white text-md md:text-xl">Smart, efficient, enhances comprehension and super-charges self-expression.</p>
          </div>
        </div>
        <div className="w-full md:w-1/4 ">
          <div className="bg-yellow-500 p-6 h-80">
            <h2 className="text-4xl font-bold mb-2">Smart</h2>
            <p className="font-light text-white text-md md:text-xl">Smart, efficient, enhances comprehension and super-charges self-expression.</p>
          </div>
        </div>
      </div>
    </div> */}










<div className="relative">
  <div className="absolute -left-6 top-10 hidden md:block"><RotatingKey startRotation={-20} endRotation={40} bgImage="image_want.png" width={160} height={160 } /></div>
</div>

<div className="mb-32" id="what"></div>

<div className="container mx-auto px-12 lg:px-32 mt-32" >
  <div className="text-left">
    <div className="font-bold text-green-500 text-4xl md:text-5xl my-4">What is Jimple?</div>
    <div className="font-light text-gray-400 text-md md:text-xl mb-16">
    It's simple. Jimple is an Augmented Assisted Communication (AAC) platform that leverages AI to supercharge communication. 
    {/* Unlock this innovative solution for only <span className="text-white font-bold">{price}</span>, and discover a whole new world of effortless communication. */}
    </div>
  </div>
  


          <div className="max-w-800 w-full">
            <video className="w-full" controls>
              <source src="/jimple_ad.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
        </div>


  <div className="flex flex-wrap content-center">
    <div className="w-full md:w-3/6 pr-4 mb-16 md:mb-12">
      {/* <div className="h-32 md:h-40 mb-4 md:mb-12 img-intuitive"></div> */}
      <p className="font-bold my-4  text-green-500 text-2xl">Intuitive</p>
      <p className="font-light text-gray-400 text-md md:text-xl">With Jimple, users can express themselves with greater ease and precision, while family and community members can communicate with them more effectively than ever before.</p>
    </div>

    <div className="w-full md:w-3/6 pr-4 mb-16 md:mb-12">
      {/* <div className="h-32 md:h-40 mb-4 md:mb-12 img-adaptive"></div> */}
      <p className="font-bold text-green-500 my-4 text-2xl">Adaptive</p>
      <p className="font-light text-gray-400 text-md md:text-xl">Our platform learns and adapts to each user's unique communication style, providing a more personalized and nuanced conversation experience.</p>
    </div>
  </div>
  
  <div className="flex flex-wrap content-center">
    <div className="w-full md:w-3/6 pr-4 mb-16 md:mb-12">
      {/* <div className="h-32 md:h-40 mb-4 md:mb-12 img-inclusive"></div> */}
      <p className="font-bold text-green-500 mb-4 text-2xl">Inclusive</p>
      <p className="font-light text-gray-400 text-md md:text-xl">With context-aware AI technology, users can enjoy a more natural and organic conversational flow, making communication more intuitive and enjoyable for everyone.</p>
    </div>
    <div className="w-full md:w-3/6 pr-4 mb-16 md:mb-12">
      {/* <div className="h-32 md:h-40 mb-4 md:mb-12 img-inclusive"></div> */}
      <p className="font-bold text-green-500 mb-4 text-2xl">Proactive<span className="text-xs align-super"> coming soon</span></p>
      <p className="font-light text-gray-400 text-md md:text-xl">Jimple acts as your personal call agent, making real phone calls to speak with people and complete tasks on your behalf, streamlining your communication and productivity.</p>
    </div>
  </div>

      
</div>

     




<div className="relative">
  <div className="absolute -left-6 -top-8 hidden md:block"><RotatingKey startRotation={-20} endRotation={40} bgImage="image_outside.png" width={200} height={200 } /></div>
</div>



<div className="mb-48" id="about"></div>
      <div className="container mx-auto px-12 lg:px-32 mt-32" >
        <div className="flex flex-wrap content-center">
       
            <div className="font-bold my-4 text-blue-500 text-4xl md:text-5xl ">About Jimple</div>
            <div className="font-light text-gray-400 text-md md:text-xl">At Jimple, we are passionate about empowering individuals facing communication challenges to express their thoughts, feelings, and ideas with ease and precision. We understand the immense hurdles they encounter every day and are committed to breaking down communication barriers through our AI-driven visual communication platform.
              <br/><br/>
              Our platform is more than just a tool - it's a gateway to inclusivity and a more connected world. With Jimple, users can express themselves in their unique way, and family and community members can engage with them on a more profound level than ever before.
              <br/><br/>
              We believe that everyone deserves to be heard and understood, and that's why we've created a platform that learns and adapts to each user's communication style. Our context-aware AI technology provides a more natural and organic conversational flow, making communication more intuitive and enjoyable for everyone involved.
              <br/><br/>
              At Jimple, we're not just changing the way people communicate - we're changing lives. Join us in our mission to promote inclusivity and empower individuals facing communication challenges to reach their full potential.
            </div>
        </div>
      </div>



<div className="relative">
  <div className="absolute -right-8 hidden md:block"><RotatingKey startRotation={-30} endRotation={40} bgImage="image_love.png" width={220} height={220 } /></div>
</div>


<div className="mb-36" id="parents"></div>
      <div className="container mx-auto px-12 lg:px-32">
        <div className="flex flex-wrap content-center">
          <p className="font-bold my-4 text-rose-500 text-4xl md:text-5xl">For parents and carers</p>
          <div className="font-light text-gray-400 text-md md:text-xl">
            Our platform and company are dedicated to providing more than just a communication product. We're committed to ensuring that your loved one feels supported, safe, and independent. With our solution, you can find peace of mind knowing that your family member can function effectively and autonomously, fostering a sense of security and confidence for both parents and users alike.
            <br /><br />
            We understand the challenges individuals and their caregivers face when navigating communication difficulties. That's why we're here to offer peace of mind and empower individuals of all ages to communicate with confidence and independence.
          </div>
        </div>
      </div>


      <div className="container mx-auto px-12 lg:px-32 mt-16">
        <div className="flex flex-wrap content-center">
          <div className="w-full md:w-2/6 pr-6 mb-16 md:mb-12">
            <p className="font-bold my-4 text-2xl text-rose-500">Peace of mind</p>
            <p className="font-light text-gray-400 text-xl md:text-1xl">
              With Jimple, you can rest assured knowing that you or your loved one has access to a powerful AI-driven communication platform designed to meet their unique needs. Our user-friendly interface and customizable features make communication accessible and enjoyable for individuals of all ages and abilities.
            </p>
          </div>

          <div className="w-full md:w-2/6 pr-6 mb-16 md:mb-12">
            <p className="font-bold my-4 text-2xl text-rose-500">Promoting independence</p>
            <p className="font-light text-gray-400 text-xl md:text-1xl">
              We believe in the importance of fostering independence in individuals with communication difficulties. Jimple provides the tools and support you need to express yourself effectively and interact with the world around you on your own terms. From basic communication to complex interactions, our platform helps you build vital skills for independence and self-expression.
            </p>
          </div>

          <div className="w-full md:w-2/6 pr-6 mb-16 md:mb-12">
            <p className="font-bold my-4 text-2xl text-rose-500">Creating inclusive communications</p>
            <p className="font-light text-gray-400 text-xl md:text-1xl">
              Communication is key to building connections and fostering inclusion. With Jimple, we're committed to creating more inclusive communication environments where every person's voice is heard and valued. Our platform promotes diversity, understanding, and acceptance, helping to bridge the gap between individuals with and without communication difficulties.
            </p>
          </div>
        </div>
</div>

<div className="relative">
  <div className="absolute left-0 -top-12 hidden md:block"><RotatingKey startRotation={20} endRotation={-60} bgImage="image_hands.png" width={170} height={170 } /></div>
</div>

      <div className="container mx-auto px-12 lg:px-32 mt-32">
        <div className="font-bold my-4 text-2xl text-rose-500">What our community is saying</div>
      </div>

      <div className="container mx-auto px-12 lg:px-32">
        <div className="flex flex-wrap content-center">
          <div className="w-full md:w-2/6 pr-6 mb-16 md:mb-12">
            <div className="font-light text-gray-400 text-xl md:text-1xl bg-neutral-800 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl p-6">
              <div>"Jimple is as simple as it sounds... This gamechanger app has and is turning our worlds upside down and all around, and in the best kind of way."</div>
            </div>
            <div className="w-16 h-16 bg-blue-500 rounded-full mt-6"></div>
          </div>

          <div className="w-full md:w-2/6 pr-6 mb-16 md:mb-12">
            <div className="font-light text-gray-400 text-xl md:text-1xl bg-neutral-800 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl p-6">
              <div>"The app is visually stimulating, easy to navigate, and the features are endless. It truly achieves the only ever goal we set for our son, independence! Thank you!"</div>
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-full mt-6"></div>
          </div>

          <div className="w-full md:w-2/6 pr-6 mb-16 md:mb-12">
            <div className="font-light text-gray-400 text-xl md:text-1xl bg-neutral-800 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl p-6">
            "My son Archer has now been given a superpower! With one touch of a button the sentences flow and he is free to communicate with family and friends, and more importantly, in real-time."
            </div>
            <div className="w-16 h-16 bg-rose-500 rounded-full mt-6"></div>
          </div>
        </div>
      </div>

      <div className="relative">
  <div className="absolute right-0 hidden md:block"> <RotatingKey startRotation={20} endRotation={-60} bgImage="image_hungry.png" width={250} height={250 } /></div>
</div>








      <div className="w-full flex justify-center items-center p-10 py-32 bg-neutral-900 mt-48 font-thin">
        <div className="columns-1">
          <div className="flex justify-between ">
            <div className="h-6 w-6 md:h-12 md:w-12 mr-12 bg-blue-500 rounded-full"></div>
            <div className="h-6 w-6 md:h-12 md:w-12 mr-12 bg-green-500 rounded-full"></div>
            <div className="h-6 w-6 md:h-12 md:w-12 mr-12 bg-rose-500 rounded-full"></div>
            <div className="h-6 w-6 md:h-12 md:w-12 bg-yellow-500 rounded-full"></div>
          </div>
          <div className="flex justify-center pt-10 text-sm text-slate-400">
            Jimple&trade; is the registered trademark of  <strong className="ml-1 text-blue-100">JIMPLE PTY LTD.</strong>
          </div>
          <div className="flex justify-center pt-3 text-sm  text-slate-400">
            <a className="text-slate-50" href="privacypolicy/"> Privacy Policy</a>
          </div>

          <div className="flex justify-center pt-3 text-sm  text-slate-400">
            Copyright &copy; 2024 Jimple Pty. Ltd.  All rights reserved
          </div>
          <div className="flex justify-center pt-1 text-sm  text-slate-400">
            For any enquires, please email:
            <a className="text-slate-50" href="mailto:info@jimple.io"> info@jimple.io</a>
          </div>
        </div>
      </div>





    </div>



  )

}

export default Index;