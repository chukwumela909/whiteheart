import { createClient } from '@/lib/supabase/server'

/**
 * Get the current authenticated user
 * Returns null if no user is authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current user's profile
 * Returns null if no user is authenticated or profile doesn't exist
 */
export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile
}

/**
 * Get user's addresses
 * Returns empty array if no addresses found
 */
export async function getUserAddresses() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data: addresses, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching addresses:', error)
    return []
  }

  return addresses || []
}

/**
 * Get user's cart items with product details
 */
export async function getUserCart() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      products (
        id,
        name,
        description,
        price,
        image_url,
        category
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching cart:', error)
    return []
  }

  return cartItems || []
}

/**
 * Get user's orders
 */
export async function getUserOrders() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await createClient()
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (
          name,
          image_url
        )
      ),
      user_addresses (
        country,
        city,
        address_line1
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return orders || []
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}
