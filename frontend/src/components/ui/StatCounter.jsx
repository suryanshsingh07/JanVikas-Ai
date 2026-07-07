import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation, useMotionValue, useTransform, animate } from 'framer-motion';

const StatCounter = ({ value, duration = 2, className = '' }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const controls = useAnimation();
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
            const animation = animate(count, value, { duration });
            return animation.stop;
        }
    }, [inView, count, value, duration, controls]);

    return (
        <motion.span ref={ref} className={className} animate={controls}>
            {rounded}
        </motion.span>
    );
};

export default StatCounter;