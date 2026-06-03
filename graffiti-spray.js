(function () {
    "use strict";

    var DEFAULT_RADIUS = 17;
    var DEFAULT_PARTICLES = 54;
    var DEFAULT_CONTOUR_PARTICLES = 10;

    var colorPresets = {
        "#E0E1DD": {
            radius: 21,
            particles: 68,
            contourParticles: 14,
            alphaMin: 0.22,
            alphaMax: 0.50,
            contourAlphaBoost: 0.06,
            dotMin: 2,
            dotMax: 10
        },
        "#778DA9": {
            radius: 19,
            particles: 60,
            contourParticles: 12,
            alphaMin: 0.22,
            alphaMax: 0.52,
            contourAlphaBoost: 0.06,
            dotMin: 2,
            dotMax: 9
        },
        "#1B263B": {
            radius: 18,
            particles: 56,
            contourParticles: 11,
            alphaMin: 0.24,
            alphaMax: 0.54,
            contourAlphaBoost: 0.07,
            dotMin: 2,
            dotMax: 8
        },
        "#0D1B2A": {
            radius: 16,
            particles: 52,
            contourParticles: 10,
            alphaMin: 0.26,
            alphaMax: 0.56,
            contourAlphaBoost: 0.07,
            dotMin: 2,
            dotMax: 8
        }
    };

    function parseHex(hex) {
        var h = hex.replace("#", "");
        if (h.length === 3) {
            h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        }
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16)
        };
    }

    function rgba(hex, a) {
        var c = parseHex(hex);
        return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
    }

    function getPreset(color) {
        return colorPresets[color] || {
            radius: DEFAULT_RADIUS,
            particles: DEFAULT_PARTICLES,
            contourParticles: DEFAULT_CONTOUR_PARTICLES,
            alphaMin: 0.22,
            alphaMax: 0.52,
            contourAlphaBoost: 0.06,
            dotMin: 2,
            dotMax: 8
        };
    }

    function paintParticle(ctx, px, py, r, alpha, color, strongCenter) {
        var grad, midAlpha;

        midAlpha = strongCenter ? alpha * 0.78 : alpha * 0.62;
        grad = ctx.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0, rgba(color, alpha));
        grad.addColorStop(0.42, rgba(color, midAlpha));
        grad.addColorStop(1, rgba(color, 0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function sprayAt(ctx, x, y, color) {
        var preset = getPreset(color);
        var i, angle, dist, px, py, r, alpha, fillReach, ringMin, ringSpan, boost;

        fillReach = preset.radius * 0.82;
        boost = preset.contourAlphaBoost || 0.06;
        ringMin = preset.radius * 0.78;
        ringSpan = preset.radius * 0.22;

        for (i = 0; i < preset.particles; i++) {
            angle = Math.random() * Math.PI * 2;
            dist = Math.sqrt(Math.random()) * fillReach;
            px = x + Math.cos(angle) * dist;
            py = y + Math.sin(angle) * dist;
            r = preset.dotMin + Math.random() * (preset.dotMax - preset.dotMin);
            alpha = preset.alphaMin + Math.random() * (preset.alphaMax - preset.alphaMin);

            paintParticle(ctx, px, py, r, alpha, color, true);
        }

        for (i = 0; i < (preset.contourParticles || 0); i++) {
            angle = Math.random() * Math.PI * 2;
            dist = ringMin + Math.random() * ringSpan;
            px = x + Math.cos(angle) * dist;
            py = y + Math.sin(angle) * dist;
            r = preset.dotMin + Math.random() * (preset.dotMax - preset.dotMin) * 0.85;
            alpha = preset.alphaMin + Math.random() * (preset.alphaMax - preset.alphaMin) + boost;
            if (alpha > 0.62) {
                alpha = 0.62;
            }

            paintParticle(ctx, px, py, r, alpha, color, false);
        }
    }

    window.sprayPaint = { sprayAt: sprayAt };
})();
