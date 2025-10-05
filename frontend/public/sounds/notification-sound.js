// Simple notification sound generator using Web Audio API
// This creates a pleasant notification sound without requiring external audio files

export function playNotificationSound(type = 'default') {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Different sounds for different notification types
    const soundProfiles = {
      default: { frequency: 800, duration: 0.15, type: 'sine' },
      success: { frequency: 880, duration: 0.2, type: 'sine' },
      warning: { frequency: 600, duration: 0.25, type: 'sine' },
      error: { frequency: 400, duration: 0.3, type: 'square' },
      info: { frequency: 750, duration: 0.15, type: 'sine' }
    };

    const profile = soundProfiles[type] || soundProfiles.default;
    
    // Create oscillator (tone generator)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.type = profile.type;
    oscillator.frequency.value = profile.frequency;
    
    // Fade in and out for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + profile.duration);
    
    // Play sound
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + profile.duration);
    
    // For multi-tone notification (more pleasant)
    if (type === 'default' || type === 'info') {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.type = 'sine';
      oscillator2.frequency.value = profile.frequency * 1.5; // Higher harmonic
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + profile.duration);
      
      oscillator2.start(audioContext.currentTime + 0.05);
      oscillator2.stop(audioContext.currentTime + profile.duration);
    }
    
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

// Play a sequence of tones for urgent notifications
export function playUrgentSound() {
  playNotificationSound('warning');
  setTimeout(() => playNotificationSound('warning'), 150);
}

