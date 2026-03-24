import { User, Settings, Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Grid } from '@/components/layout/Grid'
import { ArtworkCard } from '@/components/artwork/ArtworkCard'

// Mock data for demonstration
const mockArtworks = Array.from({ length: 6 }, (_, i) => ({
  id: `profile-${i + 1}`,
  title: `AI Artwork #${i + 1}`,
  description: 'Generated with AI Model',
  imageUrl: '',
  price: '0.1',
  currency: 'ETH',
  creator: 'Current User'
}))

export function ProfilePage() {
  const handleArtworkView = (artwork: typeof mockArtworks[0]) => {
    console.log('View artwork:', artwork)
  }

  const handleEditProfile = () => {
    console.log('Edit profile')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card padding="lg" className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900">Artist Name</h2>
            <p className="text-secondary-600 mb-4">0x1234...5678</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Created</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Collected</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Favorites</span>
                <span className="font-medium">89</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Button variant="outline" size="md" fullWidth onClick={handleEditProfile}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <button className="flex items-center space-x-2 text-primary-600 font-medium">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Created</span>
                </button>
                <button className="flex items-center space-x-2 text-secondary-600">
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </button>
              </div>
              
              <Grid columns={3} gap="md" responsive={false}>
                {mockArtworks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    variant="default"
                    onView={handleArtworkView}
                    showPrice={true}
                    showCreator={false}
                  />
                ))}
              </Grid>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
