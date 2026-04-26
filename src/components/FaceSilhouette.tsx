export default function FaceSilhouette() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex items-center justify-center">
      <svg
        viewBox="0 0 400 600"
        className="h-full max-h-screen w-auto opacity-90"
        style={{ maxWidth: "60vw" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="line-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation={2.5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="soft-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation={5} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hair-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <linearGradient id="face-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
        </defs>

        {/* ── ВОЛОСЫ ── */}
        {/* Основная масса волос */}
        <path
          d="M 200 30 C 140 28 95 45 80 80 C 65 110 70 130 68 155 C 58 140 52 120 55 95 C 60 55 100 20 200 18 C 300 20 340 55 345 95 C 348 120 342 140 332 155 C 330 130 335 110 320 80 C 305 45 260 28 200 30 Z"
          fill="url(#hair-grad)"
          filter="url(#soft-glow)"
        />
        {/* Пряди слева */}
        <path
          d="M 80 100 C 72 130 68 160 70 200 C 62 170 60 135 68 100"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d="M 70 120 C 58 155 55 190 60 230"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Пряди справа */}
        <path
          d="M 320 100 C 328 130 332 160 330 200 C 338 170 340 135 332 100"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d="M 330 120 C 342 155 345 190 340 230"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* ── КОНТУР ЛИЦА ── */}
        <path
          d="M 200 52 C 155 52 118 68 105 100 C 90 135 90 170 95 205 C 100 238 108 262 118 280 C 132 305 148 320 165 332 C 178 340 188 344 188 358 L 212 358 C 212 344 222 340 235 332 C 252 320 268 305 282 280 C 292 262 300 238 305 205 C 310 170 310 135 295 100 C 282 68 245 52 200 52 Z"
          fill="url(#face-grad)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.2}
          filter="url(#line-glow)"
        />

        {/* ── ШЕЯ ── */}
        <path
          d="M 188 358 C 185 372 183 390 182 408 L 218 408 C 217 390 215 372 212 358"
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
        />
        {/* Линии шеи */}
        <line x1="190" y1="362" x2="188" y2="406" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />
        <line x1="210" y1="362" x2="212" y2="406" stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} />

        {/* ── БРОВИ ── */}
        {/* Левая бровь */}
        <path
          d="M 130 168 C 140 160 155 157 170 159 C 160 158 145 163 133 170"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />
        {/* Правая бровь */}
        <path
          d="M 270 168 C 260 160 245 157 230 159 C 240 158 255 163 267 170"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />

        {/* ── ГЛАЗА ── */}
        {/* Левый глаз — верхнее веко */}
        <path
          d="M 128 195 C 138 185 152 182 165 183 C 152 183 138 188 128 195"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />
        {/* Левый глаз — нижнее веко */}
        <path
          d="M 128 195 C 138 203 152 205 165 203 C 152 204 138 200 128 195"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Левый зрачок */}
        <ellipse cx="147" cy="193" rx="7" ry="8" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.2} />
        <ellipse cx="147" cy="193" rx="3" ry="3.5" fill="rgba(255,255,255,0.4)" />
        {/* Блик на глазу */}
        <ellipse cx="150" cy="190" rx="1.5" ry="1.5" fill="rgba(255,255,255,0.9)" />
        {/* Ресницы левого глаза */}
        <line x1="128" y1="193" x2="122" y2="188" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="133" y1="187" x2="130" y2="181" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="140" y1="183" x2="139" y2="177" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="148" y1="182" x2="148" y2="176" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="156" y1="183" x2="157" y2="177" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="162" y1="185" x2="165" y2="180" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />

        {/* Правый глаз — верхнее веко */}
        <path
          d="M 272 195 C 262 185 248 182 235 183 C 248 183 262 188 272 195"
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />
        {/* Правый глаз — нижнее веко */}
        <path
          d="M 272 195 C 262 203 248 205 235 203 C 248 204 262 200 272 195"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Правый зрачок */}
        <ellipse cx="253" cy="193" rx="7" ry="8" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.2} />
        <ellipse cx="253" cy="193" rx="3" ry="3.5" fill="rgba(255,255,255,0.4)" />
        {/* Блик */}
        <ellipse cx="256" cy="190" rx="1.5" ry="1.5" fill="rgba(255,255,255,0.9)" />
        {/* Ресницы правого глаза */}
        <line x1="272" y1="193" x2="278" y2="188" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="267" y1="187" x2="270" y2="181" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="260" y1="183" x2="261" y2="177" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="252" y1="182" x2="252" y2="176" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="244" y1="183" x2="243" y2="177" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />
        <line x1="238" y1="185" x2="235" y2="180" stroke="rgba(255,255,255,0.6)" strokeWidth={1} strokeLinecap="round" />

        {/* ── НОС ── */}
        {/* Спинка носа */}
        <path
          d="M 200 200 C 198 215 196 228 192 240 C 189 248 185 254 183 260"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        {/* Кончик и крылья */}
        <path
          d="M 183 260 C 185 266 192 270 200 270 C 208 270 215 266 217 260"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={1.5}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />
        {/* Левое крыло носа */}
        <path
          d="M 183 260 C 178 258 174 255 175 250"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        {/* Правое крыло носа */}
        <path
          d="M 217 260 C 222 258 226 255 225 250"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />

        {/* ── СКУЛЫ — световые блики ── */}
        <path
          d="M 110 220 C 118 228 125 232 130 230"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <path
          d="M 290 220 C 282 228 275 232 270 230"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* ── ГУБЫ ── */}
        {/* Верхняя губа — контур */}
        <path
          d="M 172 300 C 180 294 190 291 200 292 C 210 291 220 294 228 300"
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={1.8}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />
        {/* Купидонов лук */}
        <path
          d="M 188 296 C 193 290 200 288 207 290 C 201 289 194 291 188 296"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        {/* Нижняя губа */}
        <path
          d="M 172 300 C 182 312 196 316 200 316 C 204 316 218 312 228 300"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={1.8}
          strokeLinecap="round"
          filter="url(#line-glow)"
        />
        {/* Блик на нижней губе */}
        <path
          d="M 193 310 C 197 313 203 313 207 310"
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Линия между губами */}
        <path
          d="M 175 300 C 190 303 210 303 225 300"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* ── ПОДБОРОДОК — контур ── */}
        <path
          d="M 172 330 C 183 342 200 346 228 330"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* ── УШИ ── */}
        {/* Левое ухо */}
        <path
          d="M 95 210 C 88 218 86 232 89 245 C 91 255 96 260 101 258"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d="M 95 215 C 91 225 91 238 95 248"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        {/* Правое ухо */}
        <path
          d="M 305 210 C 312 218 314 232 311 245 C 309 255 304 260 299 258"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d="M 305 215 C 309 225 309 238 305 248"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />

        {/* ── КЛЮЧИЦЫ ── */}
        <path
          d="M 155 420 C 170 415 185 412 200 412 C 215 412 230 415 245 420"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <path
          d="M 148 422 C 135 418 120 418 108 422"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />
        <path
          d="M 252 422 C 265 418 280 418 292 422"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
