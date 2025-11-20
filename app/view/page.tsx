"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import useDataBasic from "@/src/hooks/useDataBasic";
import { useLoading } from "@/app/providers/LoadingProvider";
interface Star {
  x: number
  y: number
  r: number
  o: number
  targetO: number
  pulseSpeed: number
}

interface Meteor {
  x: number
  y: number
  l: number
  xs: number
  ys: number
}

interface Particle {
  x: number
  y: number
  angle: number
  distance: number
  speed: number
  color: string
}

export default function ViewPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [showShimmer, setShowShimmer] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)



  const { title, logo, webName,description,image } = useDataBasic();


  const { setLoading } = useLoading();


  const headline = title;

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Typing effect for headline
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(headline)
      return
    }

    let index = 0
    const interval = setInterval(() => {
      if (index <= headline.length) {
        setDisplayedText(headline.substring(0, index))
        index++
      } else {
        clearInterval(interval)
        setShowShimmer(true)
      }
    }, 60)

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  // Canvas animation for starfield, meteors, and orbiting particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    // Background stars (static)
    const bgStars: { x: number; y: number; r: number }[] = []
    for (let i = 0; i < 100; i++) {
      bgStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 0.5,
      })
    }

    // Twinkling stars (mid-layer)
    const twinkleStars: Star[] = []
    for (let i = 0; i < 120; i++) {
      twinkleStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2,
        o: Math.random() * 0.5 + 0.2,
        targetO: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      })
    }

    // Meteors (shooting stars) - reduced if prefers-reduced-motion
    const meteors: Meteor[] = []
    const meteorCount = prefersReducedMotion ? 0 : 4
    const randomMeteor = (): Meteor => ({
      x: Math.random() * w,
      y: Math.random() * h * 0.5,
      l: Math.random() * 80 + 10,
      xs: -6 - Math.random() * 4,
      ys: 6 + Math.random() * 4,
    })

    for (let i = 0; i < meteorCount; i++) {
      meteors.push(randomMeteor())
    }

    // Orbiting particles around hero (center) and logo (top-right)
    const particles: Particle[] = []
    const heroX = w / 2
    const heroY = h / 3
    const logoX = w - 60
    const logoY = 60

    for (let i = 0; i < 12; i++) {
      particles.push({
        x: heroX + Math.cos((i / 6) * Math.PI) * 120,
        y: heroY + Math.sin((i / 6) * Math.PI) * 120,
        angle: (i / 6) * Math.PI,
        distance: 120,
        speed: Math.random() * 0.005 + 0.002,
        color: i % 2 === 0 ? "#FFD700" : "#9370DB",
      })
    }

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: logoX + Math.cos((i / 4) * Math.PI) * 80,
        y: logoY + Math.sin((i / 4) * Math.PI) * 80,
        angle: (i / 4) * Math.PI,
        distance: 80,
        speed: Math.random() * 0.008 + 0.003,
        color: i % 2 === 0 ? "#FFD700" : "#64C8FF",
      })
    }

    let lastParallaxX = 0
    let lastParallaxY = 0

    function draw() {
      ctx.fillStyle = "#050716"
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = "rgba(255,255,255,0.2)"
      for (let i = 0; i < bgStars.length; i++) {
        const s = bgStars[i]
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let i = 0; i < twinkleStars.length; i++) {
        const s = twinkleStars[i]
        s.o += (s.targetO - s.o) * s.pulseSpeed
        if (Math.abs(s.targetO - s.o) < 0.01) {
          s.targetO = Math.random() * 0.5 + 0.2
        }
        ctx.fillStyle = `rgba(255,255,255,${s.o})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (!prefersReducedMotion) {
        for (let i = 0; i < meteors.length; i++) {
          const m = meteors[i]
          const grad = ctx.createLinearGradient(m.x, m.y, m.x + m.l, m.y - m.l)
          grad.addColorStop(0, "rgba(255,255,255,1)")
          grad.addColorStop(1, "rgba(255,255,255,0)")
          ctx.strokeStyle = grad
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(m.x, m.y)
          ctx.lineTo(m.x + m.l, m.y - m.l)
          ctx.stroke()

          m.x += m.xs
          m.y += m.ys
          if (m.x < 0 || m.y > h) {
            meteors[i] = randomMeteor()
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const isHeroParticle = i < 12
        const centerX = isHeroParticle ? heroX : logoX
        const centerY = isHeroParticle ? heroY : logoY

        // Update angle for orbit
        p.angle += p.speed

        // Apply parallax shift
        const parallaxShift = prefersReducedMotion ? 0 : 0.02
        const pxShift = lastParallaxX * parallaxShift
        const pyShift = lastParallaxY * parallaxShift

        p.x = centerX + Math.cos(p.angle) * p.distance + pxShift
        p.y = centerY + Math.sin(p.angle) * p.distance + pyShift

        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.7
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastParallaxX = e.clientX - w / 2
      lastParallaxY = e.clientY - h / 2
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [prefersReducedMotion])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 },
    }),
  }

  return (
    <div
      className="relative w-full min-h-screen flex flex-col items-center justify-start overflow-hidden"
      dir="rtl"
      style={{
        background: "linear-gradient(to bottom, #050716, #0B1024, #14193A)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 w-full h-full"
        style={{ background: "transparent" }}
        aria-hidden="true"
      />

      <div className="absolute top-6 right-10 z-10">
        <motion.div
          animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{
            filter: "drop-shadow(0 0 20px #FFD700) drop-shadow(0 0 40px #FFD70080)",
          }}
        >
          <img src="logoA.png" alt="منصة أثراء" className="w-16 h-16 md:w-20 md:h-20" />
        </motion.div>
      </div>

      <motion.div
        className="z-10 flex flex-col items-center justify-center gap-8 px-4 max-w-2xl pt-20 md:pt-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Image - now centered above the title */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src={image}
            alt="منصة أثراء المعرفية"
            className="w-64 md:w-80 lg:w-96"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: [1, 1.02, 1],
                    rotate: [0, 0.5, -0.5, 0],
                  }
            }
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              filter: "drop-shadow(0 0 40px #9370DB80) drop-shadow(0 0 20px #64C8FF40)",
            }}
          />
        </motion.div>

        {/* Text Content - centered below image */}
        <div className="flex flex-col items-center gap-6">
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-center leading-tight"
            style={{
              color: "#E0E6FF",
              textShadow: "0 0 25px #9370DB, 0 0 50px #64C8FF",
              minHeight: "1.2em",
            }}
          >
            {displayedText || "\u200B"}
            {displayedText.length < headline.length && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
              >
                |
              </motion.span>
            )}
          </motion.h1>

          {showShimmer && !prefersReducedMotion && (
            <motion.div
              className="absolute -inset-2 pointer-events-none"
              animate={{
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 6,
              }}
              style={{
                background: "linear-gradient(90deg, transparent, #64C8FF80, transparent)",
              }}
            />
          )}

          {/* Subheading */}
          <motion.p
            className="text-sm md:text-base text-center opacity-70"
            style={{ color: "#E0E6FF" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            المجتمع الأول للبحوث والمقالات العلمية
          </motion.p>

          <motion.button
            onClick={() =>{ setLoading(true); router.push("/")}}
            whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            className="mt-4 px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
            style={{
              background: "linear-gradient(90deg, #9370DB, #64C8FF)",
              color: "#E0E6FF",
              boxShadow: "0 0 30px #9370DB80, 0 0 60px #64C8FF40",
              focusRingColor: "#64C8FF",
            }}
            aria-label="انضم الآن لمنصة أثراء"
          >
        عرض المنصة
          </motion.button>

          {/* Short description - below button */}
          <p
            className="mt-6 text-sm md:text-base max-w-2xl leading-relaxed text-center opacity-80"
            style={{ color: "#E0E6FF" }}
          >
           {description}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="z-10 mt-16 md:mt-24 flex flex-col gap-6 md:gap-8 px-4 max-w-2xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {[
          {
            title: "مشاركة الأبحاث",
            desc: "أنشر نتائجك وشارك مجتمع المعرفة.",
            icon: "/assets/icons/share.svg",
          },
          {
            title: "اكتشاف المحتوى",
            desc: "ابحث عن مقالات وأوراق بتصنيفات دقيقة.",
            icon: "/assets/icons/discover.svg",
          },
          {
            title: "تواصل وتعاون",
            desc: "ابنِ جسورًا مع باحثين يشاركونك الاهتمام.",
            icon: "/assets/icons/connect.svg",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={
              prefersReducedMotion
                ? {}
                : {
                    y: -8,
                    boxShadow: "0 0 30px #64C8FF, inset 0 0 20px #64C8FF20",
                  }
            }
            className="relative p-6 md:p-8 rounded-2xl backdrop-blur-md border transition-all cursor-pointer group overflow-hidden w-full"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(100,200,255,0.3), transparent)",
                  width: "30%",
                }}
              />
            )}

            <h3 className="text-lg md:text-xl font-bold mb-3 text-center" style={{ color: "#FFD700" }}>
              {card.title}
            </h3>
            <p className="text-sm md:text-base text-center opacity-80 leading-relaxed" style={{ color: "#E0E6FF" }}>
              {card.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="z-10 mt-20 flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div
          className="w-32 h-32 rounded-full border-2 flex items-center justify-center overflow-hidden"
          style={{
            borderColor: "#9370DB",
            boxShadow: "0 0 30px #9370DB80",
          }}
        >
          <img src="/engineer.jpg" alt="مصمم المنصة" className="w-full h-full object-cover" />
        </div>
        <p className="text-base md:text-lg opacity-70 text-center" style={{ color: "#E0E6FF" }}>
          المهندس:هيثم عادل الغباري
        </p>
      </motion.div>

      <footer className="z-10 text-center pb-6 mt-20 opacity-60 text-xs md:text-sm" style={{ color: "#E0E6FF" }}>
        © جميع الحقوق محفوظة — منصة أثراء
      </footer>
    </div>
  )
}
