// Tailwind arbitrary variants for nested component elements and states.

const compoundTailwindStyles: Record<string, string> = {
  "about-benefits":
    "[&_article]:grid [&_article]:[grid-template-columns:52px_1fr] [&_article]:[gap:18px] [&_article]:items-center [&_article]:[background:#fffdfa] [&_article]:[border:1px_solid_#dedbd5] [&_article]:[border-radius:7px] [&_article]:[padding:22px_25px] [&_article]:[transition:transform_.2s,_border-color_.2s] [&_article:hover]:[transform:translateX(4px)] [&_article:hover]:[border-color:#a9cfe4] [&_h3]:[color:#102a4c] [&_h3]:[font-size:14px] [&_h3]:[margin:0_0_5px] [&_p]:[color:#687887] [&_p]:[font-size:11px] [&_p]:[line-height:1.65] [&_p]:m-0 max-[560px]:[&_article]:[grid-template-columns:42px_1fr] max-[560px]:[&_article]:[padding:18px_15px] max-[560px]:[&_article]:[gap:13px]",
  "about-category-card":
    "[&_h3]:[color:#102a4c] [&_h3]:[font-size:14px] [&_h3]:[margin:0_0_5px] [&_p]:[color:#687887] [&_p]:[font-size:11px] [&_p]:[line-height:1.65] [&_p]:m-0 hover:[transform:translateY(-4px)] hover:[border-color:#a9cfe4] hover:[box-shadow:0_13px_28px_rgba(16,42,76,.07)] [&_>_span]:[color:#9bbbcf] [&_>_span]:font-display [&_>_span]:[font-size:25px] [&_>_span]:[margin-bottom:32px] [&_h3]:font-display [&_h3]:[font-size:19px] [&_strong]:flex [&_strong]:items-center [&_strong]:[gap:7px] [&_strong]:[color:#175a88] [&_strong]:[font-size:10px] [&_strong]:[margin-top:auto] [&_strong]:[padding-top:16px] max-[560px]:[&_>_span]:[margin-bottom:20px]",
  "about-faq":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:clamp(31px,_3.5vw,_44px)] [&_h2]:[line-height:1.08] [&_h2]:[letter-spacing:-.04em] [&_h2]:m-0 [&_>_div:first-child_>_p:last-child]:[color:#687887] [&_>_div:first-child_>_p:last-child]:[font-size:12px] [&_>_div:first-child_>_p:last-child]:[line-height:1.65] [&_>_div:first-child_>_p:last-child]:[margin-top:14px] max-[560px]:[&_h2]:[font-size:33px]",
  "about-final":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:clamp(31px,_3.5vw,_44px)] [&_h2]:[line-height:1.08] [&_h2]:[letter-spacing:-.04em] [&_h2]:m-0 [&_.container]:[min-height:205px] [&_.container]:flex [&_.container]:items-center [&_.container]:justify-between [&_.container]:[gap:35px] [&_h2]:[font-size:clamp(28px,_3vw,_39px)] [&_p:not(.section-label)]:[color:#5d7181] [&_p:not(.section-label)]:[font-size:12px] [&_p:not(.section-label)]:[margin:10px_0_0] max-[560px]:[&_.container]:[min-height:260px] max-[560px]:[&_.container]:flex-col max-[560px]:[&_.container]:items-start max-[560px]:[&_.container]:justify-center max-[560px]:[&_.button]:w-full",
  "about-hero":
    "[&_h1]:[color:#102a4c] [&_h1]:font-display [&_h1]:[font-size:clamp(39px,_4.4vw,_60px)] [&_h1]:[line-height:1.02] [&_h1]:[letter-spacing:-.045em] [&_h1]:m-0 [&_h1]:[max-width:680px] max-[560px]:[&_h1]:[font-size:39px]",
  "about-hero-visual":
    "[&::before]:content-[''] [&::before]:absolute [&::before]:[width:90px] [&::before]:[height:90px] [&::before]:[border:1px_solid_#a9cfe4] [&::before]:[border-radius:50%] [&::before]:[left:-28px] [&::before]:[top:32px] [&_img]:relative [&_img]:w-full [&_img]:[height:382px] [&_img]:block [&_img]:object-cover [&_img]:[border-radius:4px] [&_img]:[filter:saturate(.72)_contrast(.96)] [&_figcaption]:absolute [&_figcaption]:[right:-20px] [&_figcaption]:[bottom:34px] [&_figcaption]:[width:225px] [&_figcaption]:[background:#fffbf7] [&_figcaption]:[border:1px_solid_#dedbd5] [&_figcaption]:[border-radius:5px] [&_figcaption]:[padding:16px] [&_figcaption]:[box-shadow:0_10px_28px_rgba(16,42,76,.09)] [&_figcaption_span]:block [&_figcaption_strong]:block [&_figcaption_span]:[color:#42a6d9] [&_figcaption_span]:[font-size:9px] [&_figcaption_span]:uppercase [&_figcaption_span]:[letter-spacing:.12em] [&_figcaption_span]:[margin-bottom:6px] [&_figcaption_strong]:[color:#102a4c] [&_figcaption_strong]:font-display [&_figcaption_strong]:[font-size:15px] [&_figcaption_strong]:[line-height:1.3] max-[900px]:[&_img]:[height:330px] max-[560px]:[&_img]:[height:265px] max-[560px]:[&_figcaption]:[right:12px] max-[560px]:[&_figcaption]:[bottom:-20px] max-[560px]:[&_figcaption]:[width:205px]",
  "about-purpose-copy":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:clamp(31px,_3.5vw,_44px)] [&_h2]:[line-height:1.08] [&_h2]:[letter-spacing:-.04em] [&_h2]:m-0 [&_>_p:not(.section-label)]:[color:#596a79] [&_>_p:not(.section-label)]:[font-size:14px] [&_>_p:not(.section-label)]:[line-height:1.85] [&_>_p:not(.section-label)]:[margin:20px_0] max-[560px]:[&_>_p:not(.section-label)]:[font-size:13px]",
  "about-section-head":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:clamp(31px,_3.5vw,_44px)] [&_h2]:[line-height:1.08] [&_h2]:[letter-spacing:-.04em] [&_h2]:m-0 [&_>_p:last-child]:[color:#667786] [&_>_p:last-child]:[font-size:13px] [&_>_p:last-child]:[margin:11px_0_0]",
  "active-filters":
    "[&_span]:[padding:5px_9px] [&_span]:[font-size:10px] [&_span]:[color:#2e607f] [&_span]:[border:1px_solid_#cfe1ed] [&_span]:[border-radius:15px] [&_span]:[background:#edf6fb] [&_.button]:[margin-left:5px] max-[560px]:[&_span]:[white-space:nowrap] max-[560px]:[&_.button]:[white-space:nowrap]",
  "approach-grid":
    "[&_h3]:[color:#102a4c] [&_h3]:[font-size:14px] [&_h3]:[margin:0_0_5px] [&_p]:[color:#687887] [&_p]:[font-size:11px] [&_p]:[line-height:1.65] [&_p]:m-0 [&_article]:[padding-right:35px] [&_article_+_article]:[border-left:1px_solid_#dedbd5] [&_article_+_article]:[padding-left:35px] [&_.icon]:[color:#42a6d9] [&_.icon]:[margin-bottom:17px] [&_h3]:[font-size:13px] max-[560px]:[&_article]:[padding:22px_0] max-[560px]:[&_article_+_article]:[border-left:0] max-[560px]:[&_article_+_article]:[border-top:1px_solid_#dedbd5] max-[560px]:[&_article_+_article]:[padding-left:0]",
  "beliefs-grid":
    "[&_article]:[min-height:230px] [&_article]:[background:#fffdfa] [&_article]:[border:1px_solid_#dedbd5] [&_article]:[border-radius:7px] [&_article]:[padding:24px] [&_article]:[transition:transform_.2s,_border-color_.2s] [&_article:hover]:[transform:translateY(-4px)] [&_article:hover]:[border-color:#a9cfe4] [&_article_>_span]:[width:43px] [&_article_>_span]:[height:43px] [&_article_>_span]:grid [&_article_>_span]:[place-items:center] [&_article_>_span]:[border-radius:50%] [&_article_>_span]:[background:#e9f4fc] [&_article_>_span]:[color:#102a4c] [&_article_>_span]:[margin-bottom:40px] [&_h3]:[color:#102a4c] [&_h3]:font-display [&_h3]:[font-size:20px] [&_h3]:[margin:0_0_9px] [&_p]:[color:#657584] [&_p]:[font-size:11px] [&_p]:[line-height:1.7] [&_p]:m-0 max-[560px]:[&_article]:[min-height:185px] max-[560px]:[&_article_>_span]:[margin-bottom:24px]",
  brand: "[&_>_span:last-child_span]:[color:#1687e8]",
  "brand-mark":
    "[&_i]:[height:6px] [&_i]:[border-radius:1px_4px_4px_1px] [&_i]:[background:#102a4c] [&_i]:[border-left:4px_solid_#1687e8] max-[560px]:[&_i]:[height:5px]",
  breadcrumbs: "[&_a:hover]:[color:#1687e8]",
  button:
    "active:[transform:translateY(1px)] disabled:[opacity:.55] disabled:[cursor:not-allowed]",
  "button-icon":
    "[width:40px] [height:40px] inline-flex items-center justify-center [border-radius:50%] relative hover:[background:#edf5fa] [&.active]:[color:#1687e8] [&.active]:[background:#e9f4fc]",
  "button-primary": "hover:[background:#174271]",
  "button-secondary": "hover:[border-color:#60a5fa] hover:[background:#f3f9fd]",
  "card-body":
    "[&_h3]:[color:#102a4c] [&_h3]:[font-size:14px] [&_h3]:[line-height:1.25] [&_h3]:[margin:9px_0] [&_h3]:[min-height:35px] max-[560px]:[&_h3]:[font-size:11px] max-[560px]:[&_h3]:[min-height:42px] max-[560px]:[&_h3]:[margin:7px_0]",
  "cart-empty": "[&_h3]:[color:#102a4c]",
  check:
    "[&_input]:[width:14px] [&_input]:[height:14px] [&_input]:m-0 [&_input]:[accent-color:#102a4c] [&_input]:shrink-0 [&_em]:[color:#89919a] [&_em]:not-italic",
  cover:
    "[&::before]:content-[''] [&::before]:absolute [&::before]:[inset:0] [&::before]:[opacity:.18] [&::before]:[background-image:radial-gradient(circle_at_20%_20%,_#fff_0_1px,_transparent_1.5px)] [&::before]:[background-size:13px_13px] [&_>_*]:relative [&_>_*]:[z-index:1] [&_strong]:[white-space:pre-line] [&_strong]:font-display [&_strong]:[font-size:clamp(15px,_1.5vw,_24px)] [&_strong]:[line-height:1.04] [&_strong]:[margin-top:13px] [&_strong]:uppercase [&_small]:[margin-top:auto] [&_small]:[font-size:7px] [&_small]:[opacity:.8] max-[560px]:[&_strong]:[font-size:13px]",
  "cover-art":
    "[&_span]:[width:15%] [&_span]:[height:42%] [&_span]:[background:#72b5d1] [&_span]:[border-radius:50%_50%_3px_3px] [&_span]:relative [&_span]:[box-shadow:inset_0_-8px_rgba(0,0,0,.12)] [&_span:nth-child(2)]:[height:62%] [&_span:nth-child(2)]:[background:#eeaa66] [&_span:nth-child(3)]:[height:76%] [&_span:nth-child(3)]:[background:#f0d06f] [&_span:nth-child(4)]:[height:55%] [&_span:nth-child(4)]:[background:#7ec799] [&_span:nth-child(5)]:[height:38%] [&_span:nth-child(5)]:[background:#d98f9f]",
  "cover-small":
    "[&_.cover-kicker]:[font-size:4px] [&_.cover-kicker]:[padding-bottom:4px] [&_strong]:[font-size:12px] [&_strong]:[margin-top:7px] [&_small]:[font-size:5px] [&_.cover-art]:[padding:5px_2px] max-[560px]:[&_strong]:[font-size:9px]",
  "desktop-icon": "max-[560px]:hidden",
  "detail-copy":
    "[&_h1]:[margin:12px_0_15px] [&_>_.section-label]:flex [&_>_.section-label]:[margin-bottom:12px] [&_>_p:not(.section-label)]:[color:#61707f] [&_>_p:not(.section-label)]:[font-size:14px] [&_>_p:not(.section-label)]:[line-height:1.75] [&_>_p:not(.section-label)]:[max-width:590px] [&_>_p:not(.section-label)]:[margin:24px_0] [&_ul]:p-0 [&_ul]:list-none [&_ul]:grid [&_ul]:[gap:10px] [&_ul]:[color:#40576b] [&_ul]:[font-size:13px] [&_li]:flex [&_li]:[gap:9px] [&_li]:items-center [&_li_.icon]:[color:#2e8062] max-[560px]:[&_h1]:[font-size:29px]",
  "drawer-foot":
    "[&_>_div]:flex [&_>_div]:justify-between [&_small]:text-center [&_small]:[color:#8a9097]",
  "drawer-head":
    "[&_h2]:m-0 [&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:25px] [&_h2_span]:[color:#1687e8] [&_h2_span]:font-sans [&_h2_span]:[font-size:13px]",
  "drawer-item":
    "[&_.cover]:[width:58px] [&_.cover]:[height:78px] [&_.cover]:[padding:4px] [&_.cover_strong]:[font-size:7px] [&_.cover-kicker]:hidden [&_.cover_small]:hidden [&_>_div]:flex [&_>_div]:flex-col [&_>_div]:[gap:8px] [&_strong]:[font-size:12px] [&_strong]:[color:#102a4c] [&_span]:[font-size:12px]",
  "editorial-page":
    "[&_h1]:[color:#102a4c] [&_h1]:font-display [&_h1]:[font-size:clamp(27px,_3.2vw,_40px)] [&_h1]:[line-height:1.12] [&_h1]:[letter-spacing:-.025em] [&_h1]:m-0 [&_h1]:[font-weight:400] [&_>_div:last-child_>_p:not(.section-label)]:[color:#61707f] [&_>_div:last-child_>_p:not(.section-label)]:[line-height:1.7] [&_>_div:last-child_>_p:not(.section-label)]:[margin:20px_0_28px] max-[560px]:[&_h1]:[font-size:33px]",
  "editorial-photo": "[height:480px] [border-radius:8px]",
  empty:
    "[&_h2]:[margin:24px_0_8px] [&_h2]:[color:#102a4c] [&_h2]:[font-size:19px] [&_p]:[color:#75808b] [&_p]:[font-size:12px] [&_p]:[max-width:320px] [&_p]:[line-height:1.6] [&_p]:[margin:0_0_20px] [&_.button]:[min-width:160px] [&_.button]:[margin-top:9px] max-[560px]:[&_h2]:[font-size:17px]",
  "faq-intro":
    "[&_h2]:m-0 [&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:clamp(31px,_3.5vw,_45px)] [&_h2]:[line-height:1.04] [&_h2]:[letter-spacing:-.03em] [&_h2]:[font-weight:400] [&_h2_em]:[color:#42a6d9] [&_h2_em]:[font-weight:500] [&_>_p:not(.section-label)]:[color:#576878] [&_>_p:not(.section-label)]:[font-size:12px] [&_>_p:not(.section-label)]:[line-height:1.6] [&_>_p:not(.section-label)]:[max-width:390px] [&_>_p:not(.section-label)]:[margin:12px_0_0] [&_>_p:not(.section-label)]:[margin:18px_0_22px] [&_.button]:[border-radius:22px] max-[560px]:[&_h2]:[font-size:33px]",
  "faq-list":
    "[&_details_+_details]:[border-top:1px_solid_#dedbd5] [&_summary]:list-none [&_summary]:[min-height:43px] [&_summary]:[padding:11px_16px] [&_summary]:flex [&_summary]:items-center [&_summary]:justify-between [&_summary]:[gap:20px] [&_summary]:cursor-pointer [&_summary]:[color:#263e56] [&_summary]:[font-size:11px] [&_summary]:[font-weight:500] [&_summary::-webkit-details-marker]:hidden [&_summary_span]:[font-size:17px] [&_summary_span]:[font-weight:400] [&_summary_span]:[transition:transform_.2s] [&_details[open]_summary_span]:[transform:rotate(45deg)] [&_details[open]_summary]:[background:#f5fafd] [&_details_p]:[color:#62717e] [&_details_p]:[font-size:11px] [&_details_p]:[line-height:1.65] [&_details_p]:m-0 [&_details_p]:[padding:2px_36px_14px_16px] max-[560px]:[&_summary]:[font-size:10px]",
  "filter-controls":
    "[&_fieldset]:border-0 [&_fieldset]:[margin:0_0_22px] [&_fieldset]:p-0 [&_legend]:w-full [&_legend]:[color:#203b57] [&_legend]:[font-weight:700] [&_legend]:[font-size:11px] [&_legend]:[margin-bottom:10px] [&_.apply]:w-full max-[560px]:[&_.apply]:sticky max-[560px]:[&_.apply]:[bottom:0] max-[560px]:[&_.apply]:[box-shadow:0_-12px_18px_#fffbf7]",
  "filter-sheet":
    "max-[900px]:[&_.filter-controls]:grid max-[900px]:[&_.filter-controls]:[grid-template-columns:1fr_1fr] max-[900px]:[&_.filter-controls]:[gap:0_25px] max-[900px]:[&_.apply]:[grid-column:1_/_-1] max-[560px]:[&_.filter-controls]:block",
  "filter-title":
    "[&_h2]:[color:#102a4c] [&_h2]:m-0 [&_h2]:[font-size:15px] [&_.button]:[font-size:10px]",
  finder:
    "[&_h2]:m-0 [&_h2]:[color:#102a4c] [&_h2]:[font-size:20px] [&_h2]:[letter-spacing:-.025em] [&_p]:[margin:5px_0_0] [&_p]:[font-size:11px] [&_p]:[color:#687483] [&_>_.button]:[height:40px] [&_>_.button]:[min-height:40px] [&_>_.button]:whitespace-nowrap [&_>_.button]:[padding-inline:20px] max-[900px]:[&_>_.button]:[align-self:end] max-[900px]:[&_>_.button]:[grid-column:1_/_-1] max-[560px]:[&_>_.button]:[min-height:46px] max-[560px]:[&_h2]:[font-size:17px]",
  "footer-brand":
    "[&_>_strong]:text-white [&_>_strong]:[font-size:12px] [&_p]:[color:#b8c7da] [&_p]:[font-size:10px] [&_p]:[line-height:1.65] [&_p]:[max-width:290px] [&_p]:[margin:13px_0_0]",
  "footer-statement":
    "[&_p]:font-display [&_p]:text-white [&_p]:[font-size:clamp(21px,_2vw,_29px)] [&_p]:[line-height:1.15] [&_p]:[letter-spacing:-.01em] [&_p]:m-0 [&_p_em]:[color:#56b8ee] [&_p_em]:not-italic max-[560px]:[&_p]:[font-size:25px]",
  "founder-biography":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[letter-spacing:-.045em] [&_h2]:m-0 [&_h2]:[font-size:clamp(35px,_4vw,_52px)] [&_h2]:[line-height:1.05] [&_>_p:not(.section-label)]:[color:#526777] [&_>_p:not(.section-label)]:[font-size:15px] [&_>_p:not(.section-label)]:[line-height:1.9] [&_>_p:not(.section-label)]:[max-width:620px] [&_>_p:not(.section-label)]:[margin:0_0_27px] max-[560px]:[&_>_p:not(.section-label)]:[font-size:13px]",
  "founder-focus":
    "[&_>_.icon]:[color:#42a6d9] [&_>_.icon]:shrink-0 [&_span]:[color:#637787] [&_span]:[font-size:10px] [&_span]:[line-height:1.5] [&_strong]:block [&_strong]:[color:#102a4c] [&_strong]:[font-size:11px] [&_strong]:[margin-bottom:3px]",
  "founder-identity":
    "[&::before]:content-[''] [&::before]:absolute [&::before]:[width:330px] [&::before]:[height:330px] [&::before]:[left:-100px] [&::before]:[top:-90px] [&::before]:[border:1px_solid_rgba(96,165,250,.38)] [&::before]:[border-radius:50%] [&::after]:content-[''] [&::after]:absolute [&::after]:[inset:18px] [&::after]:[border:1px_solid_rgba(255,255,255,.13)] [&::after]:[border-radius:4px] [&_>_*]:relative [&_>_*]:[z-index:1] [&_>_strong]:font-display [&_>_strong]:[font-size:clamp(39px,_4vw,_53px)] [&_>_strong]:[line-height:.98] [&_>_strong]:[font-weight:500] [&_>_span:last-child]:[margin-top:22px] [&_>_span:last-child]:[color:#91cbea] [&_>_span:last-child]:[font-size:8px] [&_>_span:last-child]:[letter-spacing:.16em] [&_>_span:last-child]:uppercase",
  "founder-led-note":
    "[&_h3]:[color:#102a4c] [&_h3]:font-display [&_h3]:[font-size:19px] [&_h3]:[margin:0_0_5px] [&_p]:[color:#657584] [&_p]:[font-size:11px] [&_p]:[line-height:1.6] [&_p]:m-0 [&_p]:[max-width:620px] max-[560px]:[&_.text-link]:[grid-column:2]",
  "founder-spotlight":
    "[&_.container]:grid [&_.container]:[grid-template-columns:.82fr_1.18fr] [&_.container]:items-center [&_.container]:[gap:clamp(60px,_10vw,_130px)] max-[900px]:[&_.container]:[gap:55px] max-[560px]:[&_.container]:[grid-template-columns:1fr] max-[560px]:[&_.container]:[gap:33px]",
  "founders-closing":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[letter-spacing:-.045em] [&_h2]:m-0 [&_h2]:[font-size:clamp(32px,_3.7vw,_47px)] [&_h2]:[line-height:1.08] [&_.container]:[min-height:245px] [&_.container]:flex [&_.container]:justify-between [&_.container]:items-center [&_.container]:[gap:50px] [&_h2]:[max-width:720px] [&_h2]:[font-size:clamp(29px,_3.5vw,_43px)] [&_p:not(.section-label)]:[max-width:680px] [&_p:not(.section-label)]:[color:#5b6e7e] [&_p:not(.section-label)]:[font-size:12px] [&_p:not(.section-label)]:[line-height:1.65] [&_p:not(.section-label)]:[margin:12px_0_0] max-[900px]:[&_.container]:flex-col max-[900px]:[&_.container]:items-start max-[900px]:[&_.container]:justify-center max-[900px]:[&_.container]:[padding-block:45px] max-[560px]:[&_.container]:[min-height:330px]",
  "founders-hero":
    "[&_h1]:[color:#102a4c] [&_h1]:font-display [&_h1]:[letter-spacing:-.045em] [&_h1]:m-0 [&_h1]:[font-size:clamp(40px,_4.8vw,_64px)] [&_h1]:[line-height:.98] [&_h1]:[max-width:670px] max-[560px]:[&_h1]:[font-size:40px]",
  "founders-mission":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[letter-spacing:-.045em] [&_h2]:m-0 [&_h2]:[font-size:clamp(32px,_3.7vw,_47px)] [&_h2]:[line-height:1.08]",
  "founders-name-frame":
    "[&::before]:content-[''] [&::before]:absolute [&::before]:[inset:18px] [&::before]:[border:1px_solid_rgba(255,255,255,.18)] [&::before]:[border-radius:128px_128px_3px_3px] [&::after]:content-[''] [&::after]:absolute [&::after]:[width:170px] [&::after]:[height:170px] [&::after]:[right:-50px] [&::after]:[bottom:-45px] [&::after]:[border:1px_solid_rgba(96,165,250,.45)] [&::after]:[border-radius:50%] [&_>_*]:relative [&_>_*]:[z-index:1] [&_>_span]:[color:#86c6ec] [&_>_span]:[font-size:9px] [&_>_span]:uppercase [&_>_span]:[letter-spacing:.2em] [&_>_span]:[margin-bottom:18px] [&_>_strong]:font-display [&_>_strong]:[font-size:clamp(40px,_4vw,_55px)] [&_>_strong]:[line-height:.98] [&_>_strong]:[font-weight:500] [&_>_small]:[margin-top:34px] [&_>_small]:[padding-top:14px] [&_>_small]:[border-top:1px_solid_rgba(255,255,255,.16)] [&_>_small]:[color:#b9c9d7] [&_>_small]:[font-size:9px] [&_>_small]:uppercase [&_>_small]:[letter-spacing:.16em]",
  "founders-paper":
    "[&_span]:block [&_span]:[height:3px] [&_span]:[background:#aad0e3] [&_span]:[margin:11px_0] [&_span]:[border-radius:3px]",
  "founders-photo-note":
    "[&_span]:block [&_strong]:block [&_span]:[color:#42a6d9] [&_span]:uppercase [&_span]:[letter-spacing:.14em] [&_span]:[font-size:8px] [&_span]:[margin-bottom:7px] [&_strong]:[color:#102a4c] [&_strong]:font-display [&_strong]:[font-size:15px] [&_strong]:[line-height:1.35]",
  "founders-section-heading":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[letter-spacing:-.045em] [&_h2]:m-0 [&_h2]:[font-size:clamp(32px,_3.7vw,_47px)] [&_h2]:[line-height:1.08]",
  glass:
    "[&::after]:content-[''] [&::after]:[width:33px] [&::after]:[height:7px] [&::after]:[background:#102a4c] [&::after]:absolute [&::after]:[transform:rotate(-48deg)] [&::after]:[left:-24px] [&::after]:[bottom:-14px] [&::after]:[border-radius:5px] [&_b]:block [&_b]:[width:19px] [&_b]:[height:2px] [&_b]:[background:#7fb6d6] [&_b]:[margin:14px_auto]",
  "header-actions": "max-[560px]:[&_>_a]:hidden",
  "header-inner":
    "[&_nav]:flex [&_nav]:items-center [&_nav]:[gap:42px] [&_nav]:[font-size:13px] [&_nav]:[font-weight:600] [&_nav]:[color:#24384e] [&_nav_a:hover]:[color:#1687e8] max-[900px]:[&_nav]:hidden max-[900px]:[&_nav]:absolute max-[900px]:[&_nav]:[top:75px] max-[900px]:[&_nav]:[left:0] max-[900px]:[&_nav]:[right:0] max-[900px]:[&_nav]:[background:#fffbf7] max-[900px]:[&_nav]:[padding:22px_24px] max-[900px]:[&_nav]:[border-bottom:1px_solid_#dedbd5] max-[900px]:[&_nav]:flex-col max-[900px]:[&_nav]:items-start max-[900px]:[&_nav]:[gap:22px] max-[900px]:[&_nav]:[box-shadow:0_10px_25px_rgba(16,42,76,.08)] max-[900px]:[&_nav.nav-open]:flex max-[560px]:[&_nav]:[top:61px]",
  hero: "[&_h1]:font-display [&_h1]:[font-size:clamp(42px,_5.2vw,_70px)] [&_h1]:[color:#102a4c] [&_h1]:[line-height:.98] [&_h1]:[letter-spacing:-.035em] [&_h1]:m-0 [&_h1]:[font-weight:400] [&_h1_em]:[color:#42a6d9] [&_h1_em]:[font-weight:500] [&_>_p:not(.section-label)]:[color:#4f5f70] [&_>_p:not(.section-label)]:[font-size:15px] [&_>_p:not(.section-label)]:[margin:18px_0_22px] max-[560px]:[&_h1]:[font-size:38px] max-[560px]:[&_h1]:[line-height:1.03] max-[560px]:[&_>_p:not(.section-label)]:[font-size:13px] max-[560px]:[&_>_p:not(.section-label)]:[line-height:1.55] max-[560px]:[&_>_p:not(.section-label)]:[margin:15px_0_18px]",
  "hero-search":
    "[&_input]:flex-1 [&_input]:border-0 [&_input]:bg-transparent [&_input]:[outline:0] [&_input]:[font-size:13px] [&_input]:min-w-0 [&_input]:[color:#1f2937] [&_.button]:[width:42px] [&_.button]:[height:42px] [&_.button]:[min-height:42px] [&_.button]:p-0 [&_.button]:[border-radius:50%] [&_.button]:[margin-right:5px] max-[560px]:[&_.button]:[width:36px] max-[560px]:[&_.button]:[height:36px] max-[560px]:[&_.button]:[min-height:36px]",
  "home-card":
    "hover:[transform:translateY(-3px)] hover:[box-shadow:0_12px_30px_rgba(16,_42,_76,_.08)]",
  "icon-link":
    "[width:40px] [height:40px] inline-flex items-center justify-center [border-radius:50%] relative hover:[background:#edf5fa]",
  "label-hero":
    "[&_.icon]:[color:#1687e8] [&_.icon]:[fill:rgba(22,135,232,.08)] [&_.icon]:shrink-0",
  "mission-book":
    "[&::after]:content-[''] [&::after]:absolute [&::after]:[right:16px] [&::after]:[top:10px] [&::after]:[bottom:10px] [&::after]:[width:18px] [&::after]:[border-left:1px_solid_rgba(255,255,255,.3)] [&_span]:block [&_strong]:block [&_span]:[font-size:8px] [&_span]:uppercase [&_span]:[letter-spacing:.15em] [&_span]:[opacity:.75] [&_strong]:font-display [&_strong]:[font-size:21px] [&_strong]:[margin-top:3px]",
  "mission-card":
    "[&_.icon]:[color:#42a6d9] [&_.icon]:[margin-bottom:35px] [&_span]:block [&_span]:[height:4px] [&_span]:[border-radius:4px] [&_span]:[background:#d9e2e6] [&_span]:[margin:14px_0] [&_span:nth-of-type(2)]:[width:80%]",
  "mission-copy":
    "[&_>_p:not(.section-label)]:[color:#596c7c] [&_>_p:not(.section-label)]:[font-size:14px] [&_>_p:not(.section-label)]:[line-height:1.85] [&_>_p:not(.section-label)]:[max-width:630px] [&_>_p:not(.section-label)]:[margin:20px_0_0]",
  paper:
    "[&_i]:block [&_i]:[height:3px] [&_i]:[background:#c6dae6] [&_i]:[margin:7px_0] [&_i]:[border-radius:2px]",
  "price-row":
    "[&_strong]:[font-size:15px] max-[560px]:[&_strong]:[font-size:13px] max-[560px]:[&_.button-icon]:[width:31px] max-[560px]:[&_.button-icon]:[height:34px] max-[560px]:[&_.button-icon]:[min-height:34px]",
  "product-page":
    "[&_h1]:[color:#102a4c] [&_h1]:font-display [&_h1]:[font-size:clamp(27px,_3.2vw,_40px)] [&_h1]:[line-height:1.12] [&_h1]:[letter-spacing:-.025em] [&_h1]:m-0 [&_h1]:[font-weight:400]",
  "product-row":
    "hover:[border-color:#b9cbd7] hover:[box-shadow:0_8px_22px_rgba(16,_42,_76,_.05)]",
  rating: "[&_>_span]:[color:#e6ad3b] [&_em]:[color:#7b8792] [&_em]:not-italic",
  "results-heading":
    "[&_h1]:[color:#102a4c] [&_h1]:font-display [&_h1]:[font-size:clamp(27px,_3.2vw,_40px)] [&_h1]:[line-height:1.12] [&_h1]:[letter-spacing:-.025em] [&_h1]:m-0 [&_h1]:[font-weight:400] [&_.section-label]:[margin-bottom:9px] [&_>_div_>_p:not(.section-label)]:[font-size:11px] [&_>_div_>_p:not(.section-label)]:[color:#75808b] [&_>_div_>_p:not(.section-label)]:[margin:8px_0_0] max-[900px]:[&_>_div]:[grid-column:1_/_-1] max-[560px]:[&_h1]:font-display max-[560px]:[&_h1]:[font-weight:400] max-[560px]:[&_h1]:[letter-spacing:-.01em] max-[560px]:[&_h1]:[font-size:22px] max-[560px]:[&_h1]:[max-width:330px] max-[560px]:[&_>_div_>_p:not(.section-label)]:[margin-top:4px]",
  "review-arrows":
    "[&_.button]:[border-radius:50%] [&_.button]:[width:42px] [&_.button]:[min-height:42px] [&_.button]:p-0 [&_.button]:[font-size:17px]",
  "review-card":
    "[&_blockquote]:[color:#44596c] [&_blockquote]:[font-size:11px] [&_blockquote]:[line-height:1.65] [&_blockquote]:[margin:0_0_14px] max-[900px]:[&:nth-child(n+3)]:hidden max-[560px]:flex max-[560px]:[min-width:calc(100vw_-_54px)] max-[560px]:[scroll-snap-align:center] max-[560px]:[&:nth-child(n+3)]:flex max-[560px]:[&:nth-child(n+3)]:[min-width:calc(100vw_-_54px)] max-[560px]:[&:nth-child(n+3)]:[scroll-snap-align:center]",
  "review-dots":
    "[&_.button]:[width:28px] [&_.button]:[height:28px] [&_.button]:[min-height:28px] [&_.button_span]:[width:7px] [&_.button_span]:[height:7px] [&_.button_span]:[border-radius:50%] [&_.button_span]:[background:#afc3ce] [&_.button.active]:bg-transparent [&_.button.active_span]:[background:#102a4c]",
  "review-person":
    "[&_>_span:last-child]:flex [&_>_span:last-child]:flex-col [&_>_span:last-child]:[gap:3px] [&_strong]:[color:#102a4c] [&_strong]:[font-size:11px] [&_small]:[color:#74808b] [&_small]:[font-size:9px]",
  "reviews-head":
    "[&_h2]:m-0 [&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[font-size:clamp(31px,_3.5vw,_45px)] [&_h2]:[line-height:1.04] [&_h2]:[letter-spacing:-.03em] [&_h2]:[font-weight:400] [&_h2_em]:[color:#42a6d9] [&_h2_em]:[font-weight:500] [&_>_div:first-child_>_p:last-child]:[color:#576878] [&_>_div:first-child_>_p:last-child]:[font-size:12px] [&_>_div:first-child_>_p:last-child]:[line-height:1.6] [&_>_div:first-child_>_p:last-child]:[max-width:390px] [&_>_div:first-child_>_p:last-child]:[margin:12px_0_0] max-[560px]:[&_h2]:[font-size:33px] max-[560px]:[&_>_div:first-child_>_p:last-child]:[max-width:280px]",
  "route-list":
    "[&_>_div]:flex [&_>_div]:justify-between [&_>_div]:[gap:20px] [&_>_div]:[padding:15px_4px] [&_>_div]:[border-bottom:1px_solid_#dedbd5] [&_>_div]:[font-size:13px] [&_a]:[color:#175a88] [&_a]:[text-decoration:underline] [&_a]:[text-underline-offset:3px] [&_span]:[color:#7b8490] max-[560px]:[&_>_div]:flex-col max-[560px]:[&_>_div]:[gap:5px] max-[560px]:[&_span]:[font-size:10px]",
  "row-cart": "[&.added]:[background:#2c6e57]",
  "row-main":
    "[&_h3]:[color:#102a4c] [&_h3]:[font-size:14px] [&_h3]:[line-height:1.25] [&_h3]:[margin:9px_0] [&_h3]:[min-height:35px] [&_h3]:[min-height:0] [&_h3]:[margin:7px_0] [&_h3]:[overflow-wrap:anywhere] [&_p]:[overflow-wrap:anywhere] [&_p]:[margin:0_0_9px] [&_p]:[color:#75808b] [&_p]:[font-size:10px] [&_p_b]:[padding:0_5px] [&_p_b]:[color:#b0b4b8] max-[560px]:[&_.eyebrow]:[padding:3px_5px] max-[560px]:[&_.eyebrow]:[font-size:7px] max-[560px]:[&_h3]:[font-size:11px] max-[560px]:[&_h3]:[margin:5px_0] max-[560px]:[&_p]:[font-size:8px] max-[560px]:[&_p]:[margin-bottom:6px] max-[560px]:[&_p_b]:hidden max-[560px]:[&_p_b_+_*]:hidden max-[560px]:[&_.rating]:[font-size:8px]",
  "section-title":
    "[&_h2]:m-0 [&_h2]:[color:#102a4c] [&_h2]:[font-size:20px] [&_h2]:[letter-spacing:-.025em] [&_>_a]:flex [&_>_a]:items-center [&_>_a]:[gap:5px] [&_>_a]:[font-size:11px] [&_>_a]:[color:#47718f] max-[560px]:[&_h2]:[font-size:17px]",
  "select-field":
    "[&_select]:[border:1px_solid_#d8dfe4] [&_select]:[background:#fffcf8] [&_select]:[color:#25364a] [&_select]:[height:40px] [&_select]:[border-radius:5px] [&_select]:[padding:0_30px_0_12px] [&_select]:[font-size:12px] [&_select]:w-full [&_select]:min-w-0 [&_select]:[max-width:100%] [&_select]:[text-overflow:ellipsis] [&_span]:[font-weight:600] [&_span]:whitespace-nowrap [&_span]:overflow-hidden [&_span]:[text-overflow:ellipsis]",
  "semester-list":
    "[&_a]:[border:1px_solid_#dedbd5] [&_a]:[height:42px] [&_a]:grid [&_a]:[place-items:center] [&_a]:[border-radius:22px] [&_a]:[font-size:12px] [&_a]:[font-weight:600] [&_a:hover]:text-white [&_a:hover]:[background:#102a4c] [&_a:hover]:[border-color:#102a4c] [&_.active]:text-white [&_.active]:[background:#102a4c] [&_.active]:[border-color:#102a4c] max-[560px]:[&_a]:[min-width:60px] max-[560px]:[&_a]:[height:36px]",
  "seo-checks":
    "[&_li]:flex [&_li]:[gap:10px] [&_li]:items-center [&_.icon]:[color:#28805f]",
  "seo-page":
    "[&_h1]:[color:#102a4c] [&_h1]:font-display [&_h1]:[font-size:clamp(27px,_3.2vw,_40px)] [&_h1]:[line-height:1.12] [&_h1]:[letter-spacing:-.025em] [&_h1]:m-0 [&_h1]:[font-weight:400]",
  "sheet-back":
    "absolute [width:270px] [height:310px] [border-radius:5px] [border:1px_solid_#d5d9da] [&_span]:block [&_span]:[height:4px] [&_span]:[width:70%] [&_span]:[background:#b7d8e9] [&_span]:[margin:18px_0] [&_span]:[border-radius:4px]",
  "sheet-front":
    "absolute [width:270px] [height:310px] [border-radius:5px] [border:1px_solid_#d5d9da] [&_small]:[color:#42a6d9] [&_small]:uppercase [&_small]:[letter-spacing:.12em] [&_small]:[font-size:8px] [&_strong]:block [&_strong]:[color:#102a4c] [&_strong]:font-display [&_strong]:[font-size:23px] [&_strong]:[line-height:1.1] [&_strong]:[margin:12px_0_26px] [&_>_span]:block [&_>_span]:[height:5px] [&_>_span]:[background:#dfe5e6] [&_>_span]:[border-radius:4px] [&_>_span]:[margin:13px_0] [&_>_span:nth-of-type(2)]:[width:78%] [&_>_span:nth-of-type(3)]:[width:88%] [&_>_div]:flex [&_>_div]:[gap:11px] [&_>_div]:[margin-top:30px] [&_i]:[width:30px] [&_i]:[height:30px] [&_i]:block [&_i]:[border-radius:50%] [&_i]:[background:#e9f4fc] [&_i]:[border:1px_solid_#c5dfed]",
  "sheet-head":
    "max-[900px]:[&_h2]:[margin:10px_0_0] max-[900px]:[&_h2]:[font-size:18px] max-[900px]:[&_h2]:[color:#102a4c]",
  "site-footer":
    "[&_.footer-main]:grid [&_.footer-main]:[grid-template-columns:1.6fr_.7fr_.8fr_1.15fr] [&_.footer-main]:[gap:clamp(32px,_5vw,_68px)] [&_.footer-main]:[align-items:start] [&_.footer-main]:[padding-top:40px] [&_.footer-main]:[padding-bottom:34px] [&_.brand]:text-white [&_.brand]:[margin-bottom:16px] [&_.brand]:[font-size:23px] [&_.brand-mark]:[width:24px] [&_.brand-mark]:[height:27px] [&_.brand-mark]:[gap:3px] [&_.brand-mark_i]:[height:6px] [&_.brand-mark_i]:[background:white] [&_.brand-mark_i]:[border-left-color:#60a5fa] [&_nav]:flex [&_nav]:flex-col [&_nav]:[gap:11px] [&_nav]:[font-size:10px] [&_nav_strong]:[color:#82a7d6] [&_nav_strong]:[font-size:11px] [&_nav_strong]:[margin-bottom:3px] [&_nav_a]:[color:#edf3fa] [&_nav_a:hover]:[color:#60a5fa] max-[900px]:[&_.footer-main]:[grid-template-columns:1.35fr_.75fr_.85fr] max-[900px]:[&_.footer-main]:[gap:35px] max-[560px]:[&_.footer-main]:[grid-template-columns:1fr_1fr] max-[560px]:[&_.footer-main]:[gap:30px_22px] max-[560px]:[&_.footer-main]:[padding-top:34px] max-[560px]:[&_.footer-main]:[padding-bottom:28px] max-[560px]:[&_.brand]:[font-size:22px]",
  "team-heading":
    "[&_h2]:[color:#102a4c] [&_h2]:font-display [&_h2]:[letter-spacing:-.045em] [&_h2]:m-0 [&_h2]:[font-size:clamp(32px,_3.7vw,_47px)] [&_h2]:[line-height:1.08] [&_>_p]:[color:#657484] [&_>_p]:[font-size:12px] [&_>_p]:[margin:0_0_5px] max-[560px]:[&_>_p]:[margin-top:10px]",
  "text-link": "hover:[color:#1687e8]",
  trust:
    "[&_>_div]:flex [&_>_div]:[gap:12px] [&_>_div]:items-center [&_>_div]:[color:#102a4c] [&_>_div]:[padding-right:10px] [&_>_div_+_div]:[border-left:1px_solid_#cfe1ed] [&_>_div_+_div]:[padding-left:22px] [&_span]:[font-size:10px] [&_span]:[line-height:1.45] [&_span]:[color:#5e6e7c] [&_strong]:block [&_strong]:[color:#102a4c] max-[900px]:[&_>_div:nth-child(3)]:[border-left:0] max-[900px]:[&_>_div:nth-child(3)]:[padding-left:0] max-[560px]:[&_>_div_+_div]:[border-left:0] max-[560px]:[&_>_div_+_div]:[padding-left:0] max-[560px]:[&_>_div_+_div]:[border-top:1px_solid_#cfe1ed] max-[560px]:[&_>_div_+_div]:[padding-top:14px]",
  "url-example":
    "[&_code]:[padding:17px] [&_code]:[background:#e9f4fc] [&_code]:[color:#174b6d] [&_code]:font-sans [&_code]:[overflow-wrap:anywhere] [&_code]:[border-radius:4px]",
}

export default compoundTailwindStyles
