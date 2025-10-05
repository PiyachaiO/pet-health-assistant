const { emitToUser, emitToRole, emitToAll } = require('../config/socket');
const { supabase } = require('../config/supabase');

/**
 * Notification Service
 * จัดการการส่งการแจ้งเตือนแบบ real-time และบันทึกลงฐานข้อมูล
 */

// Helper function to format date in Thai format
function formatThaiDate(dateString) {
  try {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Asia/Bangkok'
    };
    return date.toLocaleDateString('th-TH', options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

// ==================== USER NOTIFICATIONS ====================

/**
 * แจ้งเตือนผู้ใช้เมื่อ Vet สร้างแผนโภชนาการให้
 * NOTE: ต้องเพิ่ม 'nutrition_plan_created' ใน notification_type enum ก่อน
 */
async function notifyNutritionPlanCreated(userId, nutritionData) {
  console.log('[notifyNutritionPlanCreated] ✅ NEW VERSION - Called with userId:', userId, 'nutritionData:', nutritionData);

  const notification = {
    user_id: userId,
    pet_id: nutritionData.pet_id || null,
    notification_type: 'checkup_due', // ⚠️ ใช้ enum ที่มีอยู่แล้วชั่วคราว จนกว่าจะเพิ่ม nutrition_plan_created
    title: 'แผนโภชนาการใหม่',
    message: `สัตวแพทย์ ${nutritionData.vet_name} ได้สร้างแผนโภชนาการใหม่สำหรับ ${nutritionData.pet_name}`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error('[notifyNutritionPlanCreated] Database error:', error);
    return { data, error };
  }

  if (data) {
    console.log('[notifyNutritionPlanCreated] Notification saved to DB:', data.id);
    console.log('[notifyNutritionPlanCreated] Emitting to user:', userId);

    emitToUser(userId, 'notification:nutrition_plan', {
      ...data,
      nutrition_plan: nutritionData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อ Vet อัปเดตบันทึกสุขภาพ
 */
async function notifyHealthRecordUpdated(userId, healthRecordData) {
  console.log('[notifyHealthRecordUpdated] Called with userId:', userId, 'healthRecordData:', healthRecordData);

  const notification = {
    user_id: userId,
    pet_id: healthRecordData.pet_id || null,
    notification_type: 'checkup_due', // ⚠️ ใช้ enum ที่มีอยู่แล้วชั่วคราว
    title: 'บันทึกสุขภาพอัปเดต',
    message: `สัตวแพทย์ ${healthRecordData.vet_name} ได้อัปเดตบันทึกสุขภาพของ ${healthRecordData.pet_name}`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error('[notifyHealthRecordUpdated] Database error:', error);
    return { data, error };
  }

  if (data) {
    console.log('[notifyHealthRecordUpdated] Notification saved to DB:', data.id);
    console.log('[notifyHealthRecordUpdated] Emitting to user:', userId);

    emitToUser(userId, 'notification:health_record', {
      ...data,
      health_record: healthRecordData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อสถานะนัดหมายเปลี่ยน
 */
async function notifyAppointmentStatusChanged(userId, appointmentData) {
  const statusMessages = {
    confirmed: 'นัดหมายของคุณได้รับการยืนยันแล้ว',
    cancelled: 'นัดหมายของคุณถูกยกเลิก',
    completed: 'นัดหมายของคุณเสร็จสิ้นแล้ว'
  };

  const notification = {
    user_id: userId,
    pet_id: appointmentData.pet_id || null, // เพิ่ม pet_id
    notification_type: 'appointment_reminder',
    title: 'สถานะนัดหมายเปลี่ยนแปลง',
    message: statusMessages[appointmentData.status] || 'สถานะนัดหมายของคุณมีการเปลี่ยนแปลง',
    priority: appointmentData.status === 'cancelled' ? 'high' : 'medium',
    due_date: appointmentData.appointment_date,
    is_read: false,
    is_completed: false
  };

  // บันทึกลงฐานข้อมูล
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    // ส่งผ่าน Socket.IO
    emitToUser(userId, 'notification:appointment', {
      ...data,
      appointment: appointmentData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อมีนัดหมายใหม่ (สร้างโดยสัตวแพทย์)
 */
async function notifyUserNewAppointment(userId, appointmentData) {
  console.log('[notifyUserNewAppointment] Called with userId:', userId, 'appointmentData:', appointmentData);
  
  const formattedDate = formatThaiDate(appointmentData.appointment_date);
  
  const notification = {
    user_id: userId,
    pet_id: appointmentData.pet_id || null,
    notification_type: 'appointment_reminder',
    title: 'นัดหมายใหม่',
    message: `คุณมีนัดหมายใหม่กับ ${appointmentData.vet_name} วันที่ ${formattedDate}`,
    priority: 'high',
    due_date: appointmentData.appointment_date,
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error('[notifyUserNewAppointment] Database error:', error);
    return { data, error };
  }

  if (data) {
    console.log('[notifyUserNewAppointment] Notification saved to DB:', data.id);
    console.log('[notifyUserNewAppointment] Emitting to user:', userId);
    
    emitToUser(userId, 'notification:new_appointment', {
      ...data,
      appointment: appointmentData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อสัตวแพทย์ตอบกลับ
 */
async function notifyVetResponded(userId, responseData) {
  const notification = {
    user_id: userId,
    notification_type: 'appointment_reminder',
    title: 'สัตวแพทย์ตอบกลับแล้ว',
    message: `สัตวแพทย์ ${responseData.vet_name} ได้ตอบกลับคำถามของคุณแล้ว`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(userId, 'notification:vet_response', {
      ...data,
      response: responseData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อมีแผนโภชนาการใหม่
 */
async function notifyNutritionPlanCreated(userId, petId, planData) {
  const notification = {
    user_id: userId,
    pet_id: petId,
    notification_type: 'nutrition_plan',
    title: 'แผนโภชนาการใหม่',
    message: `มีแผนโภชนาการใหม่สำหรับสัตว์เลี้ยงของคุณ: ${planData.pet_name}`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(userId, 'notification:nutrition_plan', {
      ...data,
      plan: planData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อถึงกำหนดฉีดวัคซีน
 */
async function notifyVaccinationReminder(userId, petId, vaccinationData) {
  const notification = {
    user_id: userId,
    pet_id: petId,
    notification_type: 'vaccination_due',
    title: 'เตือนฉีดวัคซีน',
    message: `${vaccinationData.pet_name} ถึงกำหนดฉีดวัคซีนแล้ว`,
    priority: 'high',
    due_date: vaccinationData.due_date,
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(userId, 'notification:vaccination', {
      ...data,
      vaccination: vaccinationData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนผู้ใช้เมื่อถึงเวลาให้ยา
 */
async function notifyMedicationReminder(userId, petId, medicationData) {
  const notification = {
    user_id: userId,
    pet_id: petId,
    notification_type: 'medication_reminder',
    title: 'เตือนให้ยา',
    message: `ถึงเวลาให้ยา ${medicationData.medication_name} สำหรับ ${medicationData.pet_name}`,
    priority: 'high',
    due_date: medicationData.due_time,
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(userId, 'notification:medication', {
      ...data,
      medication: medicationData
    });
  }

  return { data, error };
}

// ==================== VETERINARIAN NOTIFICATIONS ====================

/**
 * แจ้งเตือนสัตวแพทย์เมื่อมีนัดหมายใหม่
 */
async function notifyVetNewAppointment(vetId, appointmentData) {
  console.log('[notifyVetNewAppointment] Called with vetId:', vetId, 'appointmentData:', appointmentData);
  
  const formattedDate = formatThaiDate(appointmentData.appointment_date);
  
  const notification = {
    user_id: vetId,
    pet_id: appointmentData.pet_id || null, // เพิ่ม pet_id
    notification_type: 'appointment_reminder',
    title: 'นัดหมายใหม่',
    message: `คุณมีนัดหมายใหม่จาก ${appointmentData.user_name} วันที่ ${formattedDate}`,
    priority: 'high',
    due_date: appointmentData.appointment_date,
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) {
    console.error('[notifyVetNewAppointment] Database error:', error);
    return { data, error };
  }

  if (data) {
    console.log('[notifyVetNewAppointment] Notification saved to DB:', data.id);
    console.log('[notifyVetNewAppointment] Emitting to user:', vetId);
    
    emitToUser(vetId, 'notification:new_appointment', {
      ...data,
      appointment: appointmentData
    });

    // ส่งไปยังทุกสัตวแพทย์ที่ออนไลน์
    console.log('[notifyVetNewAppointment] Broadcasting to all vets');
    emitToRole('veterinarian', 'notification:new_appointment_broadcast', {
      ...data,
      appointment: appointmentData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนสัตวแพทย์เมื่อนัดหมายถูกยกเลิก
 */
async function notifyVetAppointmentCancelled(vetId, appointmentData) {
  const notification = {
    user_id: vetId,
    notification_type: 'appointment_reminder',
    title: 'นัดหมายถูกยกเลิก',
    message: `นัดหมายจาก ${appointmentData.user_name} ถูกยกเลิก`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(vetId, 'notification:appointment_cancelled', {
      ...data,
      appointment: appointmentData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนสัตวแพทย์เมื่อนัดหมายถูกแก้ไข
 */
async function notifyVetAppointmentUpdated(vetId, appointmentData) {
  const notification = {
    user_id: vetId,
    notification_type: 'appointment_reminder',
    title: 'นัดหมายถูกแก้ไข',
    message: `นัดหมายจาก ${appointmentData.user_name} มีการเปลี่ยนแปลง`,
    priority: 'medium',
    due_date: appointmentData.appointment_date,
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(vetId, 'notification:appointment_updated', {
      ...data,
      appointment: appointmentData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนสัตวแพทย์เมื่อมีการแจ้งเตือนด่วน
 */
async function notifyVetUrgent(vetId, urgentData) {
  const notification = {
    user_id: vetId,
    notification_type: 'health_alert',
    title: 'การแจ้งเตือนด่วน',
    message: urgentData.message,
    priority: 'high',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(vetId, 'notification:urgent', {
      ...data,
      urgent: urgentData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนสัตวแพทย์เมื่อบทความได้รับการอนุมัติ
 */
async function notifyVetArticlePublished(vetId, articleData) {
  const notification = {
    user_id: vetId,
    notification_type: 'article_published',
    title: 'บทความได้รับการเผยแพร่',
    message: `บทความ "${articleData.title}" ของคุณได้รับการอนุมัติและเผยแพร่แล้ว`,
    priority: 'low',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToUser(vetId, 'notification:article_published', {
      ...data,
      article: articleData
    });
  }

  return { data, error };
}

// ==================== ADMIN NOTIFICATIONS ====================

/**
 * แจ้งเตือนแอดมินเมื่อมีผู้ใช้ใหม่สมัครสมาชิก
 */
async function notifyAdminNewUser(userData) {
  const notification = {
    notification_type: 'system_alert',
    title: 'ผู้ใช้ใหม่สมัครสมาชิก',
    message: `${userData.full_name} (${userData.email}) เพิ่งสมัครสมาชิก`,
    priority: 'low',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToRole('admin', 'notification:new_user', {
      ...data,
      user: userData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนแอดมินเมื่อมีสัตวแพทย์สมัคร
 */
async function notifyAdminNewVetApplication(vetData) {
  const notification = {
    notification_type: 'system_alert',
    title: 'สัตวแพทย์สมัครใหม่',
    message: `${vetData.full_name} สมัครเป็นสัตวแพทย์ - รอการอนุมัติ`,
    priority: 'high',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToRole('admin', 'notification:new_vet_application', {
      ...data,
      vet: vetData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนแอดมินเมื่อมีบทความรอการอนุมัติ
 */
async function notifyAdminArticlePending(articleData) {
  const notification = {
    notification_type: 'content_approval',
    title: 'บทความรอการอนุมัติ',
    message: `บทความ "${articleData.title}" โดย ${articleData.author_name} รอการอนุมัติ`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToRole('admin', 'notification:article_pending', {
      ...data,
      article: articleData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนแอดมินเมื่อมี Nutrition Guideline รอการอนุมัติ
 */
async function notifyAdminNutritionPending(guidelineData) {
  const notification = {
    notification_type: 'content_approval',
    title: 'Nutrition Guideline รอการอนุมัติ',
    message: `คำแนะนำโภชนาการ "${guidelineData.title}" โดย ${guidelineData.vet_name} รอการอนุมัติ`,
    priority: 'medium',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToRole('admin', 'notification:nutrition_pending', {
      ...data,
      guideline: guidelineData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนแอดมินเมื่อมีการแจ้งเตือนระบบ
 */
async function notifyAdminSystemAlert(alertData) {
  const notification = {
    notification_type: 'system_alert',
    title: 'การแจ้งเตือนระบบ',
    message: alertData.message,
    priority: alertData.priority || 'high',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToRole('admin', 'notification:system_alert', {
      ...data,
      alert: alertData
    });
  }

  return { data, error };
}

/**
 * แจ้งเตือนแอดมินเมื่อมีรายงาน/ร้องเรียน
 */
async function notifyAdminUserReport(reportData) {
  const notification = {
    notification_type: 'system_alert',
    title: 'รายงาน/ร้องเรียนใหม่',
    message: `มีรายงานใหม่จาก ${reportData.reporter_name}: ${reportData.subject}`,
    priority: 'high',
    is_read: false,
    is_completed: false
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (!error && data) {
    emitToRole('admin', 'notification:user_report', {
      ...data,
      report: reportData
    });
  }

  return { data, error };
}

// ==================== BROADCAST NOTIFICATIONS ====================

/**
 * แจ้งเตือนทุกคนเมื่อมีบทความใหม่
 * สร้าง notification ให้ทุกคนที่ role = 'user' และ 'veterinarian'
 */
async function notifyAllNewArticlePublished(articleData) {
  console.log('[notifyAllNewArticlePublished] Broadcasting new article:', articleData.title);
  
  try {
    // 1. ดึงรายชื่อ users ทั้งหมด (ยกเว้น admin)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('role', ['user', 'veterinarian'])
      .eq('is_active', true);

    if (usersError) {
      console.error('[notifyAllNewArticlePublished] Error fetching users:', usersError);
      return;
    }

    console.log(`[notifyAllNewArticlePublished] Found ${users.length} users to notify`);

    // 2. สร้าง notification สำหรับทุกคน
    const notifications = users.map(user => ({
      user_id: user.id,
      pet_id: null,
      notification_type: 'article_published', // ✅ ใช้ enum ที่เพิ่มใหม่แล้ว
      title: 'บทความใหม่!',
      message: `มีบทความใหม่: "${articleData.title}"`,
      priority: 'low',
      is_read: false,
      is_completed: false
    }));

    // 3. Insert แบบ batch
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('[notifyAllNewArticlePublished] Error inserting notifications:', insertError);
    } else {
      console.log(`[notifyAllNewArticlePublished] ✅ Created ${insertedNotifications.length} notifications in database`);
    }

    // 4. Send real-time notification to all connected users
    emitToAll('notification:new_article', {
      id: articleData.id,
      type: 'global_article',
      title: 'บทความใหม่!',
      message: `มีบทความใหม่: "${articleData.title}"`,
      article: articleData,
      is_read: false,
      created_at: new Date().toISOString()
    });
    
    console.log('[notifyAllNewArticlePublished] ✅ Broadcast sent to all connected users');
  } catch (error) {
    console.error('[notifyAllNewArticlePublished] Unexpected error:', error);
  }
}

/**
 * แจ้งเตือนทุกคนเมื่อมีการประกาศสำคัญ
 */
async function notifyAllAnnouncement(announcementData) {
  emitToAll('notification:announcement', {
    title: 'ประกาศ',
    message: announcementData.message,
    priority: announcementData.priority || 'high',
    announcement: announcementData,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  // User notifications
  notifyUserNewAppointment,
  notifyAppointmentStatusChanged,
  notifyVetResponded,
  notifyNutritionPlanCreated,
  notifyHealthRecordUpdated,
  notifyVaccinationReminder,
  notifyMedicationReminder,

  // Vet notifications
  notifyVetNewAppointment,
  notifyVetAppointmentCancelled,
  notifyVetAppointmentUpdated,
  notifyVetUrgent,
  notifyVetArticlePublished,

  // Admin notifications
  notifyAdminNewUser,
  notifyAdminNewVetApplication,
  notifyAdminArticlePending,
  notifyAdminNutritionPending,
  notifyAdminSystemAlert,
  notifyAdminUserReport,

  // Broadcast notifications
  notifyAllNewArticlePublished,
  notifyAllAnnouncement
};


