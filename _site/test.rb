require 'virtus'

module Service
  def call(*args)
    new(*args).call
  end
end

class Trumpet
  extend Service
  def initialize(str)
  end
end

class Bass
  extend Service
  def initialize(str)
  end
end

class OutOfTuneError < Exception
end

class Conductor
  extend Service
  include Virtus.model

  attribute :trumpet, Trumpet, default: proc { Trumpet }
  attribute :bass,    Bass, default: proc { Bass }

  def call
    trumpet.call('C4 .. G4')
    bass.call('C2 D2 E2 E2')
  end
end

Conductor.call

Conductor.call(
  trumpet:  proc { "pouet!" },
  bass:     proc { raise OutOfTuneError }
)

